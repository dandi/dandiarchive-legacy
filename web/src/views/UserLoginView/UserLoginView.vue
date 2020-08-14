<template>
  <v-container v-page-title="'Log In'">
    <GirderAuth
      v-if="!UNIFIED_API"
      :force-otp="false"
      :show-forgot-password="false"
      :oauth="true"
    />
    <div v-if="UNIFIED_API">
      <v-alert
        v-for="err in alerts.errors"
        :key="err"
        :value="!!err"
        class="mt-0"
        dismissible="dismissible"
        transition="scale-transition"
        type="error"
      >
        {{ err }}
      </v-alert>
      <v-container>
        <v-form
          ref="login"
          @submit.prevent="login"
        >
          <v-text-field
            v-model="username"
            :rules="nonEmptyRules"
            label="Username or e-mail"
            autofocus="autofocus"
            prepend-icon="$vuetify.icons.user"
            type="text"
          />
          <v-text-field
            v-model="password"
            :rules="nonEmptyRules"
            type="password"
            label="Password"
            prepend-icon="$vuetify.icons.lock"
          />
          <v-card-actions>
            <v-btn
              :disabled="inProgress"
              :loading="inProgress"
              class="ml-0"
              type="submit"
              color="primary"
            >
              <v-icon left="left">
                $vuetify.icons.login
              </v-icon>
              Login
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-container>
    </div>
  </v-container>
</template>

<script>
import { Authentication as GirderAuth } from '@girder/components/src/components';
import { loggedIn, publishRest } from '@/rest';

export default {
  name: 'UserLoginView',
  components: {
    GirderAuth,
  },
  data() {
    return {
      username: '',
      password: '',
      inProgress: false,
      alerts: {
        errors: [],
      },
    };
  },
  computed: {
    loggedIn,
    returnTo() {
      const { returnTo } = this.$route.query;
      return returnTo ? JSON.parse(returnTo) : { name: 'home' };
    },
    nonEmptyRules() {
      return [(v) => !!v || 'Item is required'];
    },
  },
  watch: {
    loggedIn: {
      immediate: true,
      handler(val) {
        if (val) {
          this.$router.replace(this.returnTo);
        }
      },
    },
  },
  methods: {
    async login() {
      if (!this.$refs.login.validate()) {
        return;
      }
      this.alerts.errors = [];
      this.inProgress = true;
      try {
        await publishRest.login(this.username, this.password);
        this.password = '';
      } catch (err) {
        if (err.response && err.response.status === 400) {
          const { non_field_errors: errors } = err.response.data;
          this.alerts.errors.push((errors && errors[0]) || 'Unauthorized.');
        } else {
          this.alerts.errors.push('Unknown error.');
          throw err;
        }
      } finally {
        this.inProgress = false;
      }
    },
  },
};
</script>
