import { baseRequestClient, requestClient } from '#/api/request';
import { useAccessStore } from '@vben/stores';
import md5 from 'md5'

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    tokenName: string;   // 例如 "Access-Token"
    tokenValue: string;  // 例如 "xxxx"
    loginId: string;     // 例如 "10857..."
    isLogin?: boolean;
    loginType?: string;
    tokenTimeout?: number;
    sessionTimeout?: number;
    tokenSessionTimeout?: number;
    tokenActiveTimeout?: number;
    loginDevice?: string;
    tag?: any;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>(
    '/iam/authenticate/admin/login', 
    undefined,
    {
      params: {
        loginName: data.username,
        password: md5(data.password || ''),
        agreement: true,
      },
      headers: {
        'Response-Wrapper': true,
      },
    },
  );
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  const accessStore = useAccessStore();
  return baseRequestClient.post(
    '/iam/authenticate/logout', 
    {
      withCredentials: true,
      headers: {
        'Response-Wrapper': true,
        'access-token': accessStore.accessToken,
      },
    }
);
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi(userId: string) {
  const accessStore = useAccessStore();
  return requestClient.post<string[]>(
    '/iam/authenticate/listRoleCodesByUserId',
    undefined,
    {
      params: {userId},
      headers: {
        'Response-Wrapper': true,
        'access-token': accessStore.accessToken,
      },
    } as any,
  );
}
