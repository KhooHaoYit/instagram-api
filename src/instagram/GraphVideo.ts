import { Owner } from "./generic/owner";

export type GraphVideo = {
  __typename: 'GraphVideo'
  id: string
  shortcode: string
  owner?: Owner
  edge_media_to_caption?: {
    edges: {
      node: {
        text: string
      }
    }[]
  }
  edge_media_preview_like?: {
    count: number
  }
  edge_media_to_parent_comment?: {
    count: number
  }
  dimensions: {
    height: number
    width: number
  }
  video_url: string
  display_url: string
};




export function getPostId(data: GraphVideo) {
  return data.id;
}

export function getPostHeight(data: GraphVideo) {
  return data.dimensions.height;
}

export function getPostWidth(data: GraphVideo) {
  return data.dimensions.width;
}

export function getPostImageUrl(data: GraphVideo) {
  return data.display_url;
}

export function getPostVideoUrl(data: GraphVideo) {
  return data.video_url;
}

export function getAuthorRaw(data: GraphVideo) {
  if (!data.owner)
    throw new Error(`owner not defined`);
  return data.owner;
}

export function getShortcode(data: GraphVideo) {
  return data.shortcode;
}

export function getDescription(data: GraphVideo) {
  return data.edge_media_to_caption?.edges.at(0)?.node.text;
}

export function getLikes(data: GraphVideo) {
  if (!data.edge_media_preview_like)
    throw new Error(`edge_media_preview_like not defined`);
  return data.edge_media_preview_like.count;
}

export function getComments(data: GraphVideo) {
  if (!data.edge_media_to_parent_comment)
    throw new Error(`edge_media_to_parent_comment not defined`);
  return data.edge_media_to_parent_comment.count;
}
