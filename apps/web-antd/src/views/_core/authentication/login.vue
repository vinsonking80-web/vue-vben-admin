<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo-area">
        <img class="logo" src="/logo.png" alt="logo" />
        <div class="hotline">全国热线 4000-5656-80</div>
      </div>

      <a-form
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="onFinish"
      >
        <a-form-item name="loginName" label="用户名">
          <a-input
            v-model:value="formState.loginName"
            size="large"
            placeholder="请输入用户"
            autocomplete="username"
          />
        </a-form-item>

        <a-form-item name="password" label="密码">
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </a-form-item>

        <a-form-item name="agreement">
          <a-checkbox v-model:checked="formState.agreement">
            我已阅读并同意
            <a class="underline" href="javascript:void(0)">用户协议、隐私协议</a>
          </a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="authStore.loginLoading"
            :disabled="authStore.loginLoading"
          >
            立即登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form';

import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { preferences } from '@vben/preferences';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const formState = reactive({
  loginName: '',
  password: '',
  agreement: false,
});

const rules: Record<string, Rule[]> = {
  loginName: [{ required: true, message: '请输入用户', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  agreement: [
    {
      validator: async (_rule, value) => {
        if (!value) throw new Error('请阅读并同意用户协议及隐私协议');
      },
      trigger: 'change',
    },
  ],
};

async function onFinish() {
  const redirect = (route.query.redirect as string) || '';
  await authStore.authLogin(
    {
      loginName: formState.loginName,
      password: formState.password,
      agreement: formState.agreement,
    },
    async () => {
      // 登录后跳回原页面（如有），否则走默认首页
      const target = redirect
        ? decodeURIComponent(redirect)
        : preferences.app.defaultHomePath;

      await router.replace(target);
    },
  );
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f6f8;
  padding: 24px;
}
.login-card {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 28px 28px 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}
.logo-area {
  text-align: center;
  margin-bottom: 18px;
}
.logo {
  height: 54px;
}
.hotline {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.45);
}
.underline {
  text-decoration: underline;
}
</style>
