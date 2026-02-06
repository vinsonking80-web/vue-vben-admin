import type { Recordable, UserInfo } from '@vben/types';

import md5 from 'md5';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 登录
   * - 参数字段按老系统：loginName/password/agreement
   * - password 在这里 md5（与你老登录页一致）
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;

    try {
      loginLoading.value = true;

      // 1) 登录
      const loginParams = {
        loginName: params.loginName,
        password: params.password ? md5(params.password) : undefined,
      };

      const loginResp = await loginApi(loginParams);

      const tokenValue = loginResp?.tokenValue;

      if (!tokenValue) {
        // 如果接口结构变化/后端异常，这里给出明确提示
        throw new Error('登录成功但未返回 tokenValue');
      }

      // 2) 保存 token（request.ts 会把它塞进 access-token）
      accessStore.setAccessToken(tokenValue);

      // 3) 拉取用户信息（包含 elements / menuRouters）
      const legacyInfo = await getUserInfoApi();

      // 4) 映射成 vben 的 UserInfo（只放最关键字段，后续你再逐步完善）
      userInfo = {
        userId: legacyInfo.user?.userId,
        username: legacyInfo.user?.loginName,
        realName: legacyInfo.user?.userName,
        avatar: legacyInfo.user?.avatar,
        roles: legacyInfo.user?.roleIds || [],
        // homePath 可留空：框架会 fallback 到 defaultHomePath
        homePath: undefined,
      } as any;

      if (userInfo) {
        userStore.setUserInfo(userInfo);
      } else {
        // 可以考虑触发一个错误或进行其他处理，确保不会执行后续依赖 userInfo 的逻辑
        console.error('UserInfo is null or undefined');
      }

      // 5) 权限码 elements（用来做按钮级权限/指令等）
      accessStore.setAccessCodes(legacyInfo.elements || []);

      // 6) 登录过期状态处理（保留框架逻辑）
      if (accessStore.loginExpired) {
        accessStore.setLoginExpired(false);
      } else {
        if (onSuccess) {
          await onSuccess?.();
        } else {
          if (userInfo) {
            await router.push(userInfo.homePath || preferences.app.defaultHomePath);
          }
        }
      }

      if (userInfo?.realName) {
        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo.realName}`,
          duration: 3,
          message: $t('authentication.loginSuccess'),
        });
      }
    } finally {
      loginLoading.value = false;
    }

    return { userInfo };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 忽略
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    // 若你希望刷新页面后自动拉用户信息，可在这里用 getUserInfoApi()
    const legacyInfo = await getUserInfoApi();

    const userInfo = {
      userId: legacyInfo.user?.userId,
      username: legacyInfo.user?.loginName,
      realName: legacyInfo.user?.userName,
      avatar: legacyInfo.user?.avatar,
      roles: legacyInfo.user?.roleIds || [],
      homePath: undefined,
    } as any;

    userStore.setUserInfo(userInfo);
    accessStore.setAccessCodes(legacyInfo.elements || []);
    return userInfo as any;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
