import type { ComponentRecordType, GenerateMenuAndRoutesOptions } from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  // 你项目的 views 懒加载映射
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  // 布局组件映射
  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  // ✅ 最关键：强制 backend，确保 fetchMenuListAsync 一定被调用
  const accessMode = 'backend' as const;

  return await generateAccessible(accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      return await getAllMenusApi();
    },
    forbiddenComponent,
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
