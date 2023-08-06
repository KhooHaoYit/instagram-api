import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { request } from 'undici';
import { GraphSidecar } from './instagram/GraphSidecar';
import * as graphSidecar from './instagram/GraphSidecar';
import { GraphImage } from './instagram/GraphImage';
import * as graphImage from './instagram/GraphImage';
import { GraphVideo } from './instagram/GraphVideo';
import * as graphVideo from './instagram/GraphVideo';
import { AttachmentBuilder, WebhookClient } from 'discord.js';
import { env } from './env';
import * as owner from './instagram/generic/owner';

@Injectable()
export class AppService {
  webhook = new WebhookClient({
    url: env.DISCORD_WEBHOOK_URL,
  });

  constructor(
    private prisma: PrismaService,
  ) { }

  async scrapePost(shortcode: string) {
    const variables = encodeURIComponent(
      JSON.stringify({
        shortcode,
        has_threaded_comments: true,
      })
    );
    const data = await request(`https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables=${variables}`)
      .then(res =>
        res.body.json() as Promise<{
          data: { shortcode_media: GraphSidecar | GraphImage | GraphVideo }
        }>)
      .then(json => json.data.shortcode_media);
    await this.#handleAuthor(data);
    await this.#handleAttachment(data);
    await this.#handlePost(data);
  }

  async #handlePost(post: GraphSidecar | GraphImage | GraphVideo) {
    switch (post.__typename) {
      default:
        throw post satisfies never;
      case 'GraphImage':
        return await this.#ensurePostUpdated({
          id: graphImage.getPostId(post),
          attachmentIds: [
            graphImage.getPostId(post),
          ],
          authorId: owner.getUserId(
            graphImage.getAuthorRaw(post)
          ),
          comments: graphImage.getComments(post),
          likes: graphImage.getLikes(post),
          description: graphImage.getDescription(post) ?? '',
          shortcode: graphImage.getShortcode(post),
        });
      case 'GraphVideo':
        return await this.#ensurePostUpdated({
          id: graphVideo.getPostId(post),
          attachmentIds: [
            graphVideo.getPostId(post),
          ],
          authorId: owner.getUserId(
            graphVideo.getAuthorRaw(post)
          ),
          comments: graphVideo.getComments(post),
          likes: graphVideo.getLikes(post),
          description: graphVideo.getDescription(post) ?? '',
          shortcode: graphVideo.getShortcode(post),
        });
      case 'GraphSidecar':
        return await this.#ensurePostUpdated({
          id: graphSidecar.getPostId(post),
          attachmentIds: graphSidecar.getAttachmentsRaw(post)
            .map(({ node }) => {
              switch (node.__typename) {
                default:
                  throw node satisfies never;
                case 'GraphImage':
                  return graphImage.getPostId(node);
                case 'GraphVideo':
                  return graphVideo.getPostId(node);
              }
            }),
          authorId: owner.getUserId(
            graphSidecar.getAuthorRaw(post)
          ),
          comments: graphSidecar.getPostComments(post),
          likes: graphSidecar.getPostLikes(post),
          description: graphSidecar.getPostDescription(post) ?? '',
          shortcode: graphSidecar.getPostShortcode(post),
        });
    }
  }

  async #ensurePostUpdated(
    data: {
      id: string,
      authorId: string,
      comments: number,
      description: string,
      likes: number,
      shortcode: string,
      attachmentIds: string[],
    }
  ) {
    await this.prisma.post.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        attachmentIds: data.attachmentIds,
        comments: data.comments,
        likes: data.likes,
        shortcode: data.shortcode,
        description: data.description,
        author: {
          connectOrCreate: {
            where: { id: data.authorId },
            create: {
              id: data.authorId,
            }
          }
        }
      },
      update: {
        attachmentIds: data.attachmentIds,
        comments: data.comments,
        likes: data.likes,
        shortcode: data.shortcode,
        description: data.description,
        author: {
          connectOrCreate: {
            where: { id: data.authorId },
            create: {
              id: data.authorId,
            }
          }
        }
      },
    });
  }

  async #handleAuthor(post: GraphSidecar | GraphImage | GraphVideo) {
    const postOwner = post.owner!
    await this.#ensureUserUpdated({
      id: owner.getUserId(postOwner),
      handle: owner.getHandle(postOwner),
      username: owner.getUsername(postOwner),
      avatarUrl: owner.getAvatarUrl(postOwner),
    });
  }

  async #ensureUserUpdated(
    user: {
      id: string,
      handle?: string,
      username?: string,
      avatarUrl?: string,
    }
  ) {
    const newAvatarUrl = !user.avatarUrl
      ? undefined
      : await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true },
      }).then(async res => {
        const currentFilename = res?.avatarUrl?.replace(/^[^]*\//, '').replace(/\?[^]*$/, '');
        const newFilename = user.avatarUrl!.replace(/^[^]*\//, '').replace(/\?[^]*$/, '')
        if (currentFilename === newFilename)
          return undefined;
        return await this.#uploadFile(user.avatarUrl!, newFilename);
      });
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        handle: user.handle,
        username: user.username,
        avatarUrl: newAvatarUrl,
      },
      update: {
        handle: user.handle,
        username: user.username,
        avatarUrl: newAvatarUrl,
      },
    });
  }

  async #handleAttachment(post: GraphSidecar | GraphImage | GraphVideo) {
    const attachments = post.__typename !== 'GraphSidecar'
      ? [post]
      : post.edge_sidecar_to_children.edges.map(edge => edge.node);
    for (const attachment of attachments) {
      if (attachment.__typename === 'GraphImage')
        await this.#ensureAttachmentExists({
          id: graphImage.getPostId(attachment),
          height: graphImage.getPostHeight(attachment),
          width: graphImage.getPostWidth(attachment),
          imageUrl: graphImage.getPostImageUrl(attachment),
        });
      else
        await this.#ensureAttachmentExists({
          id: graphVideo.getPostId(attachment),
          height: graphVideo.getPostHeight(attachment),
          width: graphVideo.getPostWidth(attachment),
          imageUrl: graphVideo.getPostImageUrl(attachment),
          videoUrl: graphVideo.getPostVideoUrl(attachment),
        });
    }
  }

  async #ensureAttachmentExists(
    attachment: {
      id: string,
      height: number,
      width: number,
      imageUrl: string,
      videoUrl?: string,
    }
  ) {
    const exists = await this.prisma.attachment.findUnique({
      where: { id: attachment.id },
      select: { id: true },
    }).then(res => !!res);
    if (exists)
      return;
    await this.prisma.attachment.create({
      data: {
        id: attachment.id,
        height: attachment.height,
        width: attachment.width,
        imageUrl: await this.#uploadFile(
          attachment.imageUrl,
          attachment.imageUrl.replace(/^[^]*\//, '').replace(/\?[^]*$/, '')
        ),
        videoUrl: !attachment.videoUrl
          ? undefined
          : await this.#uploadFile(
            attachment.videoUrl,
            attachment.videoUrl.replace(/^[^]*\//, '').replace(/\?[^]*$/, '')
          ),
      }
    })
  }

  async #uploadFile(url: string, name: string, headers?: Record<string, string>) {
    const {
      body,
      statusCode,
    } = await request(url, { headers });
    if (statusCode !== 200)
      throw new Error(`Got statusCode: ${statusCode}, not proceeding`);
    const msg = await this.webhook.send({
      files: [
        new AttachmentBuilder(body, { name }),
      ],
    });
    return msg.attachments.at(0)!.url;
  }

}
