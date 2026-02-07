import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';
import { useAccessStore } from '@vben/stores';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  const accessStore = useAccessStore();
  return requestClient.post<UserInfo>('/iam/authenticate/admin/user',
    undefined,
    {
      headers: {
        'Response-Wrapper': true,
        "access-token": accessStore.accessToken,
      },
    },
  );
}
