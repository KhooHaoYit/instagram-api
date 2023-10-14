import { GraphImage } from "./GraphImage";
import { GraphVideo } from "./GraphVideo";
import { Owner } from "./generic/owner";

export type GraphSidecar = {
  __typename: 'GraphSidecar'
  id: string
  shortcode: string
  edge_sidecar_to_children: {
    edges: {
      node: GraphImage
      | GraphVideo
    }[]
  }
  edge_media_to_caption: {
    edges: {
      node: {
        text: string
      }
    }[]
  }
  edge_media_preview_like: {
    count: number
  }
  edge_media_to_parent_comment: {
    count: number
  }
  owner: Owner
};



export function getPostInfo(data: GraphSidecar) {
  return {
    id: data.id,
    shortcode: data.shortcode,
    description: data.edge_media_to_caption.edges.at(0)?.node.text,
    likes: data.edge_media_preview_like.count,
    comments: data.edge_media_to_parent_comment.count,
  };
}

export function getAttachmentsRaw(data: GraphSidecar) {
  return data.edge_sidecar_to_children.edges;
}

export function getAuthorRaw(data: GraphSidecar) {
  return data.owner;
}
