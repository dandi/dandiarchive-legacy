<template>
  <v-app class="dandi-app">
    <AppBar />
    <v-main>
      <UserStatusBanner />
      <router-view />
      <DandiFooter />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import AppBar from '@/components/AppBar/AppBar.vue';
import DandiFooter from '@/components/DandiFooter.vue';
import UserStatusBanner from '@/components/UserStatusBanner.vue';

export default defineComponent({
  components: {
    AppBar,
    DandiFooter,
    UserStatusBanner,
  },
  setup(props, ctx) {
    const { $router } = ctx.root;

    const redirectUrl: string|null = localStorage.getItem('dandiRedirectUrl');
    if (redirectUrl) {
      localStorage.removeItem('dandiRedirectUrl');
      $router.push(redirectUrl);
    }
  },
});
</script>

<style scoped>
.dandi-app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
