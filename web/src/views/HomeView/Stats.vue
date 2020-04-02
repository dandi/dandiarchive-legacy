<template>
  <v-container
    class="grey darken-3 pa-0"
    fluid
  >
    <v-row class="py-6">
      <template v-for="stat in stats">
        <v-col
          :key="stat.name"
          class="py-0 flex-grow-1"
          :md="2"
          :sm="4"
          :cols="6"
        >
          <Stat
            :name="
              stat.name"
            :value="stat.value"
            :description="stat.description"
          />
        </v-col>
        <!-- TODO dividers destroy the grid system breakpoints
        <v-divider
          :key="stat.name + '-divider'"
          vertical
          class="grey"
        />
        -->
      </template>
    </v-row>
  </v-container>
</template>

<script>
import Stat from '@/views/HomeView/Stat.vue';

export default {
  name: 'Stats',
  components: { Stat },
  computed: {
    stats() {
      return [
        { name: 'dandisets', value: this.$store.state.stats.drafts.toString(), description: 'Draft dandisets, that is. Publishing is coming soon™' },
        { name: 'users', value: this.$store.state.stats.users.toString() },
        { name: 'species', value: this.$store.state.stats.species.toString() },
        { name: 'subjects', value: this.$store.state.stats.subjects.toString() },
        { name: 'cells', value: this.$store.state.stats.cells.toString() },
        { name: 'total data size', value: this.$store.state.stats.size.toString() },
      ];
    },
  },
};
</script>
