import { Agent } from "https";
import { GraphImage } from "./GraphImage"
import { GraphSidecar } from "./GraphSidecar"
import { GraphVideo } from "./GraphVideo"
import fetch from 'node-fetch';

type FetchPostFailed = {
  message: "Please wait a few minutes before you try again.",
  require_login: true,
  status: "fail",
}

type FetchPostSuccess = {
  data: {
    shortcode_media:
    | GraphSidecar
    | GraphImage
    | GraphVideo
  },
  extensions: {
    is_final: true
  },
  status: "ok"
}

export async function fetchPost(shortcode: string, agent?: Agent) {
  const variables = encodeURIComponent(
    JSON.stringify({
      shortcode,
      has_threaded_comments: true,
    })
  );
  return await fetch(
    `https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables=${variables}`,
    { agent },
  ).then(res => res.json() as Promise<FetchPostFailed | FetchPostSuccess>);
}
