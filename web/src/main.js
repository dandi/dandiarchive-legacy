import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import Girder, { vuetify } from '@girder/components/src';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

import App from '@/App.vue';
import '@/featureToggle';
import router from '@/router';
import store from '@/store';
import { girderRest, publishRest } from '@/rest';
import '@/title';

Vue.use(Girder);

Sentry.init({
  dsn: process.env.VUE_APP_SENTRY_DSN,
  integrations: [new Integrations.Vue({ Vue, logErrors: true })],
});

sync(store, router);

girderRest.fetchUser().then(() => {
  // Eventually this will need to be a blocking action
  // For now it's fine not to have a working publish service running
  publishRest.fetchUser();
  new Vue({
    provide: { girderRest },
    router,
    render: (h) => h(App),
    store,
    vuetify,
  }).$mount('#app');
});
