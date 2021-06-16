// Import external packages
import Vue from 'vue';
import { provide } from '@vue/composition-api';
import { sync } from 'vuex-router-sync';
import VueGtag from 'vue-gtag';

// @ts-ignore missing definitions
import { vuetify } from '@girder/components/src';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

// Import plugins first (order may matter)
import '@/plugins/composition';
import '@/plugins/girder';

// Import custom behavior
import toggles from '@/featureToggle';
import '@/title';

// Import internal items
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import { girderRest, publishRest } from '@/rest';

Sentry.init({
  dsn: process.env.VUE_APP_SENTRY_DSN,
  environment: process.env.VUE_APP_SENTRY_ENVIRONMENT,
  integrations: [new Integrations.Vue({ Vue, logErrors: true })],
});

sync(store, router);

Vue.use(VueGtag, {
  config: { id: 'UA-146135810-2' },
}, router);

async function loadUser() {
  try {
    await publishRest.restoreLogin();
  } catch (e) {
    // a status of 401 indicates login failed, so the exception should be supressed.
    if (e.response.status === 401) {
      return;
    }
    // any other kind of exception indicates an error that shouldn't occur
    throw e;
  }
}

loadUser().then(() => {
  new Vue({
    setup() {
      provide('store', store);
      provide('girderRest', girderRest);
    },
    router,
    render: (h) => h(App),
    store,
    // @ts-ignore: missing definitions because Vue.use(Vuetify) is in a .js file
    vuetify,
  }).$mount('#app');
});
