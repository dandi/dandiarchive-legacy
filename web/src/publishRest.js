import Vue from 'vue';
import axios from 'axios';
import cookies from 'js-cookie';

// Ensure contains trailing slash
const publishApiRoot = process.env.VUE_APP_PUBLISH_API_ROOT.endsWith('/')
  ? process.env.VUE_APP_PUBLISH_API_ROOT
  : `${process.env.VUE_APP_PUBLISH_API_ROOT}/`;

function girderize(publishedDandiset) {
  const { // eslint-disable-next-line camelcase
    created, updated, dandi_id, version, metadata, name, description,
  } = publishedDandiset;
  return {
    created,
    updated,
    version,
    name,
    description,
    lowerName: dandi_id,
    meta: metadata,
  };
}

const publishRest = new Vue({
  data() {
    return {
      token: cookies.get('djangoToken'),
      user: null,
    };
  },
  methods: {
    async login(username, password) {
      const { data: { auth_token: authToken } } = await this.post('auth/token/login', { username, password });
      this.token = authToken;
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 1);
      cookies.set('djangoToken', authToken, { expires: expiration });
      await this.fetchUser();
    },
    async logout() {
      if (!this.token) {
        return;
      }
      try {
        await this.post('auth/token/logout');
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          throw error;
        }
      } finally {
        this.token = null;
        this.user = null;
        cookies.remove('djangoToken');
      }
    },
    async fetchUser() {
      try {
        const { data } = await this.get('auth/users/me/');
        this.user = data;
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          throw error;
        }
        this.user = null;
        this.token = null;
      }
      return this.user;
    },
    async assets(identifier, version, config = {}) {
      try {
        const { data } = await this.get(`api/dandisets/${identifier}/versions/${version}/assets`, config);
        return data;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return null;
        }
        throw error;
      }
    },
    async versions(identifier) {
      try {
        const { data } = await this.get(`api/dandisets/${identifier}/versions/`);
        return data;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return null;
        }
        if (error.message === 'Network Error') {
          return null;
        }
        throw error;
      }
    },
    async specificVersion(identifier, version) {
      try {
        const { data } = await this.get(`api/dandisets/${identifier}/versions/${version}/`);
        return girderize(data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return null;
        }
        throw error;
      }
    },
    async mostRecentVersion(identifier) {
      const versions = await this.versions(identifier);
      if (versions === null) {
        return null;
      }
      const { count, results } = versions;
      if (count === 0) {
        return null;
      }
      const { version } = results[0];
      return this.specificVersion(identifier, version);
    },
    assetDownloadURI(asset) {
      const { uuid, version: { version, dandiset: { identifier } } } = asset;
      return `${publishApiRoot}api/dandisets/${identifier}/versions/${version}/assets/${uuid}/download`;
    },
  },
});

const client = axios.create({ baseURL: publishApiRoot });
client.interceptors.request.use((config) => {
  if (!publishRest.token) {
    return config;
  }
  return {
    ...config,
    headers: {
      Authorization: `Token ${publishRest.token}`,
      ...config.headers,
    },
  };
});

Object.assign(publishRest, client);

export default publishRest;
