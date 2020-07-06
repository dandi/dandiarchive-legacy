<template>
  <div>
    <object-component
      :data="data"
      :schema="resolvedSchema"
      class="ml-5"
    />
  </div>
</template>

<script>
import ObjectComponent from './Object.vue';

export default {
  name: 'DandisetStats',
  components: {
    ObjectComponent,
  },
  props: {
    data: {
      // The data at the matching level of schema
      type: Object,
      required: true,
    },
    schema: {
      // The root schema of the item to render
      type: [Object],
      required: true,
    },
  },
  computed: {
    resolvedSchema() {
      return { ...this.schema.allOf[0] };
    },
    primaryKey() {
      return this.options.primaryKey;
    },
  },
  methods: {
    objectKey(item) {
      if (this.primaryKey) { return item[this.primaryKey]; }

      return Object.values(item).join('|');
    },
  },
};
</script>

<style>

</style>
