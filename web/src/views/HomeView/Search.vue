<template>
  <div
    class="grey darken-2 pa-12"
    style="width: 100%"
  >
    <v-text-field
      label="Search Dandisets"
      outlined
      solo
      style="width: 100%"
      :hide-details="true"
      append-icon="$vuetify.icons.search"
      background-color="white"
      color="black"
      data-id="search"
    />
  </div>
</template>

<script>
export default { name: 'Search' };
</script>
