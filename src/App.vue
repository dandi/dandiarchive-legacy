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

<script>
import AppBar from '@/components/AppBar/AppBar.vue';
import DandiFooter from '@/components/DandiFooter.vue';
import UserStatusBanner from '@/components/UserStatusBanner.vue';

export default {
  components: {
    AppBar,
    DandiFooter,
    UserStatusBanner,
  },
};
</script>

<style scoped>
.dandi-app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
