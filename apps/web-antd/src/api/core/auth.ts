import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数（老项目字段） */
  export interface LoginParams {
    loginName?: string;
    password?: string;
  }

  /** 老系统登录 data 结构（来自“用户登录功能接口.txt”） */
  export interface LegacyLoginData {
    tokenName: string;
    tokenValue: string;
    tokenTimeout: number;
    isLogin: boolean;
    loginId: string;
    loginType: string;
    sessionTimeout: number;
    tokenSessionTimeout: number;
    tokenActiveTimeout: number;
    loginDevice: string;
    tag: any;
  }

  /** 返回用户相关数据（用户信息、菜单、权限等） */
  export interface LegacyUserInfoResult {
    user: {
      userId: string;
      loginName: string;
      userName: string;
      avatar?: string;
      roleIds?: string[];
    };
    elements: string[];
    menuRouters: any[];
    // 可扩展字段，后端返回的其他数据
  }
}

/**
 * 登录（老系统）
 * POST /iam/authenticate/admin/login
 * 以 params 方式传参（与老 axios 保持一致）
 */
export async function loginApi(params: AuthApi.LoginParams) {
  // requestClient.post(url, data, config) —— 这里 data 传 {}，参数走 config.params
  return requestClient.post<AuthApi.LegacyLoginData>(
    '/iam/authenticate/admin/login',
    {},
    { params },
  );
}

/**
 * 退出登录（老系统）
 */
export async function logoutApi() {
  return baseRequestClient.post('/iam/authenticate/logout');
}

/**
 * 获取用户相关信息（包括菜单、权限等）
 * 返回结构参考 LegacyUserInfoResult
 */
export async function getLegacyUserBundleApi() {
  const response = await baseRequestClient.post('/iam/authenticate/admin/user');
  const data: AuthApi.LegacyUserInfoResult = response.data;

  return data; // 返回用户信息、菜单、权限等
}


/**
 * 刷新accessToken（老系统通常不用；先保留空实现以不破坏 request.ts 引用）
 * 你若后端没有该接口，建议在 preferences 里关掉 refreshToken 功能即可。
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<{ data: string; status: number }>(
    '/auth/refresh',
    {
      withCredentials: true,
    },
  );
}
