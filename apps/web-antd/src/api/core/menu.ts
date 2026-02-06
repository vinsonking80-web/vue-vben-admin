import type { RouteRecordStringComponent } from '@vben/types';

import { getLegacyUserBundleApi } from './auth';

/**
 * 获取用户所有菜单
 * 老项目是：/iam/authenticate/admin/user 返回 menuRouters
 */
export async function getAllMenusApi() {
  const legacy = await getLegacyUserBundleApi();
  const menuRouters = (legacy as any)?.menuRouters ?? [];

  // vben 的 generateAccessible 需要的是 RouteRecordStringComponent[]
  // 只要你后端返回结构里包含 component/path/name/meta 等字段（很多 Java 后端菜单就是这个结构），这里直接透传即可
  return menuRouters as RouteRecordStringComponent[];
}
