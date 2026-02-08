import type { RouteRecordStringComponent } from '@vben/types';

import { useUserStore } from '@vben/stores';
import { useAuthStore } from '#/store';

type ServerMenuRouter = {
  path: string;
  name: string;
  redirect?: string | null;
  component: string;
  hidden?: boolean;
  hideChildrenInMenu?: boolean;
  sortNumber?: number;
  isPage?: string | null; // "1" 表示页面（你服务端里有这个字段）
  meta?: {
    title?: string;
    icon?: string | null;
    keepAlive?: boolean;
    target?: string | null; // 例如 "_blank"
    hidden?: boolean;
    hiddenHeaderContent?: boolean;
    [k: string]: any;
  };
  children?: ServerMenuRouter[] | null;
};

/**
 * 把服务端 menuRouters 适配成 vben 需要的 RouteRecordStringComponent[]
 */
function normalizeMenuRouters(
  list: ServerMenuRouter[] | null | undefined,
): RouteRecordStringComponent[] {
  if (!list || !Array.isArray(list)) return [];

  const PLACEHOLDER = '/_core/placeholder/index';
  const LAYOUT_CONTAINER = new Set(['PageView', 'Page', 'RouteView']);

  const walk = (node: ServerMenuRouter): RouteRecordStringComponent => {
    const rawMeta = node.meta ?? {};

    const children = (node.children ?? [])
      .filter(Boolean)
      .map((c) => walk(c));

    const isLeaf = children.length === 0 || node.isPage === '1';

    let component = node.component;

    // PageView/Page/RouteView 等：当成布局容器
    if (LAYOUT_CONTAINER.has(component)) {
      component = 'BasicLayout';
    } else if (isLeaf) {
      // 页面先不存在：统一改成占位组件
      component = PLACEHOLDER;
    }

    const meta = {
      ...rawMeta,
      title: rawMeta.title ?? String(node.name),
      icon: rawMeta.icon ?? undefined,

      // vben 菜单控制字段
      hideInMenu: node.hidden ?? false,
      hideChildrenInMenu: node.hideChildrenInMenu ?? false,
      keepAlive: rawMeta.keepAlive ?? false,

      // target:"_blank" 兼容
      openInNewWindow: rawMeta.target === '_blank',
    };

    return {
      path: node.path,
      name: String(node.name),
      redirect: node.redirect ?? undefined,
      component,
      meta,
      children: children.length ? children : undefined,
    };
  };

  return list.map(walk);
}

/**
 * vben 动态路由/菜单拉取入口（给 access.ts 调）
 * - 不再请求后端
 * - 直接复用 userInfo.menuRouters
 * - 兜底：如果 userInfo 还没有，就 fetchUserInfo 一次
 */
export async function getAllMenusApi(): Promise<RouteRecordStringComponent[]> {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
  const menuRouters = (userInfo as any)?.menuRouters as ServerMenuRouter[] | undefined;

  const normalized = normalizeMenuRouters(menuRouters);

  // 关键兜底：默认首页是 /analytics，但后端 menuRouters 往往不含它，会导致 404
  // 先补一个占位路由，避免从 "/" 重定向到 "/analytics" 直接 NotFound
  const analyticsPlaceholder: RouteRecordStringComponent = {
    path: '/analytics',
    name: 'Analytics',
    component: '/_core/placeholder/index',
    meta: {
      title: 'Analytics',
      hideInMenu: true,
      hideInTab: false,
    },
  };

  // 如果后端本来就有 /analytics，就不重复加
  const hasAnalytics = normalized.some((r) => r.path === '/analytics');
  return hasAnalytics ? normalized : [analyticsPlaceholder, ...normalized];
}
