import {
  Controller,
  Get,
  Param,
  Post as HttpPost,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from 'nestjs-prisma';
import { Attachment, Post } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private prisma: PrismaService,
  ) { }

  @Get('/shortcodes/:id')
  async getShortcode(
    @Param('id') id: string,
    @Query() {
      includeAuthor,
      includeAttachment,
    }: Record<'includeAuthor' | 'includeAttachment', string>,
  ) {
    const post = await this.prisma.post.findFirst({
      where: { shortcode: id },
      include: {
        author: !!includeAuthor
      },
    })!;
    const attachments = includeAttachment && post
      ? await this.prisma.attachment.findMany({
        where: {
          id: { in: post.attachmentIds },
        }
      })
      : undefined;
    return JSON.stringify({
      ...post,
      attachments,
    });
  }

  @HttpPost('/shortcodes/:id/fetch')
  async fetchShortcode(
    @Param('id') id: string,
    @Query() includes: Record<'includeAuthor' | 'includeAttachment', string>,
  ) {
    await this.appService.scrapePost(id);
    return await this.getShortcode(id, includes);
  }

}
