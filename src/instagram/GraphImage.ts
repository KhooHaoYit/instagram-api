import { Owner } from "./generic/owner";

export type GraphImage = {
  __typename: 'GraphImage'
  id: string
  shortcode: string
  dimensions: {
    height: number
    width: number
  }
  display_url: string
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
};



export function getPostId(data: GraphImage) {
  return data.id;
}

export function getPostHeight(data: GraphImage) {
  return data.dimensions.height;
}

export function getPostWidth(data: GraphImage) {
  return data.dimensions.width;
}

export function getPostImageUrl(data: GraphImage) {
  return data.display_url;
}

export function getAuthorRaw(data: GraphImage) {
  if (!data.owner)
    throw new Error(`owner not defined`);
  return data.owner;
}

export function getShortcode(data: GraphImage) {
  return data.shortcode;
}

export function getDescription(data: GraphImage) {
  return data.edge_media_to_caption?.edges.at(0)?.node.text;
}

export function getLikes(data: GraphImage) {
  if (!data.edge_media_preview_like)
    throw new Error(`edge_media_preview_like not defined`);
  return data.edge_media_preview_like.count;
}

export function getComments(data: GraphImage) {
  if (!data.edge_media_to_parent_comment)
    throw new Error(`edge_media_to_parent_comment not defined`);
  return data.edge_media_to_parent_comment.count;
}
