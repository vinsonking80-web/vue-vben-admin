import { requestClient } from '#/api/request';

export interface LegacyUserMenuMeta {
  title?: string;
  icon?: string | null;
  keepAlive?: boolean;
  hidden?: boolean;
  hiddenHeaderContent?: boolean;
  target?: string | null;
}

export interface LegacyMenuRoute {
  path: string;
  name?: string;
  redirect?: string | null;
  component?: string | null;
  hidden?: boolean;
  hideChildrenInMenu?: boolean;
  meta?: LegacyUserMenuMeta;
  children?: LegacyMenuRoute[] | null;

  isLeafNode?: any;
  isPage?: any;
  sortNumber?: number;
}

export interface LegacyUser {
  userId: string;
  loginName: string;
  userName: string;
  avatar?: string;
  roleIds?: string[];
  [k: string]: any;
}

export interface LegacyUserInfoResponseData {
  menuRouters: LegacyMenuRoute[];
  pageRouters?: LegacyMenuRoute[];
  elements: string[];
  user: LegacyUser;
  staff?: any;
  driver?: any;
}

/**
 * 获取用户信息（老系统：包含菜单与 elements）
 * POST /iam/authenticate/admin/user
 */
export async function getUserInfoApi() {
  return requestClient.post<LegacyUserInfoResponseData>(
    '/iam/authenticate/admin/user',
  );
}
