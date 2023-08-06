export type Owner = {
  id: string
  username: string
  full_name: string
  profile_pic_url: string
};



export function getUserId(data: Owner) {
  return data.id;
}

export function getHandle(data: Owner) {
  return data.username;
}

export function getUsername(data: Owner) {
  return data.full_name;
}

export function getAvatarUrl(data: Owner) {
  return data.profile_pic_url;
}
