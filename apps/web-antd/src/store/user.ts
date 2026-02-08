// src/store/user.ts

import { defineStore } from 'pinia';
import { getUserInfoApi } from '#/api';  // 引入原有的获取用户信息的函数

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,  // 用来存储用户信息，包括菜单
  }),

  actions: {
    // 获取用户信息，包括菜单数据
    async fetchUserInfo() {
      try {
        // 调用原有的 getUserInfoApi 函数获取用户信息
        const response = await getUserInfoApi();
        
        // 将返回的数据存储到 userInfo 中
        this.userInfo = response?.data;
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    },
  },
});
