<template>
  <div>
    {{ data.join(', ') }}
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true,
    },
    field: {
      type: String,
      required: false,
      default: null,
    },
  },
};
</script>

<style>

</style>
