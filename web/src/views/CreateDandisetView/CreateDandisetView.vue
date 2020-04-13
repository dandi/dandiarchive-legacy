<template>
  <v-card>
    <v-card-title>
      <span class="headline">Register a new dataset</span>
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="name"
        label="Name*"
        hint="Provide a title for this dataset"
        persistent-hint
        :counter="120"
        required
      />
      <v-textarea
        v-model="description"
        label="Description*"
        hint="Provide a description for this dataset"
        :counter="3000"
        persistent-hint
        required
      />
      <small>*indicates required field</small>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        type="submit"
        color="primary"
        :disabled="saveDisabled"
        @click="register_dandiset"
      >
        Register dataset
        <template v-slot:loader>
          <span>Registering...</span>
        </template>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { loggedIn } from '@/rest';
import girderRest from '@/rest';

export default {
  name: 'CreateDandisetView',
  data() {
    return {
      name: '',
      description: '',
    };
  },
  computed: {
    saveDisabled() {
      return !(this.name && this.description);
    },
  },
  created() {
    if (!loggedIn()) {
      this.$router.push({name: 'home'});
    }
  },
  methods: {
    async register_dandiset() {
      const { name, description } = this;
      const { status, data } = await girderRest.post('dandi', null, { params: { name, description } });

      if (status === 200) {
        this.name = '';
        this.description = '';
        this.$router.push({
          name: 'dandisetLanding',
          params: { id: data._id },
        });
      }
    },
  },
};
</script>
