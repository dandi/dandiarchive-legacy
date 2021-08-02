<script>
import { copyToClipboard } from '@/utils';
import { dandiAboutUrl } from '@/utils/constants';

import CookieLaw from 'vue-cookie-law';

export default {
  name: 'DandiFooter',
  components: { CookieLaw },
  data: () => ({
    copied: false,
    dandiAboutUrl,
  }),
  computed: {
    version() {
      return process.env.VUE_APP_VERSION;
    },

    githubLink() {
      const gitRev = process.env.VUE_APP_GIT_REVISION;
      if (gitRev) {
        return `https://github.com/dandi/dandiarchive/commit/${gitRev}`;
      }
      return 'https://github.com/dandi/dandiarchive';
    },
  },
  methods: {
    versionClick() {
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 1000);
      copyToClipboard(this.version);
    },
  },
};
</script>

<template>
  <v-footer class="text-body-2">
    <v-container>
      <cookie-law theme="blood-orange">
        <div slot="message">
          We use cookies to ensure you get the best experience on DANDI.
        </div>
      </cookie-law>
      <v-row>
        <v-col offset="2">
          &copy; 2021 DANDI<br>
          version
          <v-tooltip
            v-model="copied"
            bottom
            :open-on-hover="false"
          >
            <template #activator="{ on }">
              <a
                class="version-link"
                :href="githubLink"
                target="_blank"
                rel="noopener"
                v-on="on"
              >{{ version }}</a>
            </template>
            <span>Copied to clipboard!</span>
          </v-tooltip>
        </v-col>
        <v-col>
          Funding:<br>
          - <a
            target="_blank"
            rel="noopener"
            href="https://braininitiative.nih.gov/"
          >BRAIN Initiative</a>
          <v-icon x-small>
            mdi-open-in-new
          </v-icon>
          <br>
          - <a
            target="_blank"
            rel="noopener"
            href="https://www.nimh.nih.gov/index.shtml"
          >NIMH</a>
          <v-icon x-small>
            mdi-open-in-new
          </v-icon>
          <br>
        </v-col>
        <v-col>
          Support:<br>
          - <a
            target="_blank"
            rel="noopener"
            :href="dandiAboutUrl"
          >Dandi Project Homepage</a>
          <v-icon x-small>
            mdi-open-in-new
          </v-icon>
          <br>
          - <a
            target="_blank"
            rel="noopener"
            href="https://github.com/dandi/dandiarchive"
          >Project Github</a>
          <v-icon x-small>
            mdi-open-in-new
          </v-icon> / <a
            target="_blank"
            rel="noopener"
            href="https://github.com/dandi/dandiarchive/issues"
          >Issues</a>
          <v-icon x-small>
            mdi-open-in-new
          </v-icon>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style scoped>
@media (min-width: 1904px) {
  .container {
    max-width: 1185px;
  }
}

.version-link {
  color: inherit;
}

.version-link:hover {
  text-decoration: underline;
}
</style>