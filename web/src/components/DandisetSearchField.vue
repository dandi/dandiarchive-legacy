<template>
  <v-form @submit="performSearch">
    <v-text-field
      :value="$route.query.search"
      @input="updateSearch"
      label="Search Dandisets"
      outlined
      solo
      hide-details
      :dense="dense"
      append-icon="mdi-magnify"
      @click:append="performSearch"
      background-color="white"
      color="black"
    />
  </v-form>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'DandisetSearchField',
  props: {
    dense: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      currentSearch: this.$route.query.search || '',
    };
  },
  methods: {
    updateSearch(search) {
      this.currentSearch = search;
    },
    performSearch() {
      const { currentSearch } = this;
      if (currentSearch === this.$route.query.search) {
        // nothing has changed, do nothing
        return;
      }
      if (this.$route.name !== 'searchDandisets') {
        this.$router.push({
          name: 'searchDandisets',
          query: {
            search: currentSearch,
          }
        });
      } else {
        this.$router.replace({
          ...this.$route,
          query: {
            ...this.$route.query,
            search: currentSearch,
          }
        });
      }
    }
  }
};
</script>
