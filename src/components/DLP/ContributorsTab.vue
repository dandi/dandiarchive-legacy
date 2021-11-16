<template>
  <v-dialog
    v-model="visible"
  >
    <v-card class="pa-2 px-4">
      <v-form
        v-model="complexModelValidation[propKey]"
      >
        <v-jsf
          ref="complexRef"
          :value="complexModel[propKey]"
          :schema="complexSchema.properties[propKey]"
          :options="CommonVJSFOptions"
          @input="setComplexModelProp(propKey, $event)"
        />
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { EditorInterface } from '@/utils/schema/editor';

import VJsf from '@koumoul/vjsf/lib/VJsf';
import '@koumoul/vjsf/lib/deps/third-party';
import '@koumoul/vjsf/lib/VJsf.css';

import { computed, defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'ContributorsTab',
  components: { VJsf },
  props: {
    schema: {
      type: Object,
      required: true,
    },
    meta: {
      type: Object,
      required: true,
    },
    propKey: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const editorInterface = new EditorInterface(props.schema, props.meta);
    const {
      modelValid,
      basicSchema,
      basicModel,
      basicModelValid,
      complexSchema,
      complexModel,
      setComplexModelProp,
      complexModelValid,
      complexModelValidation,
    } = editorInterface;

    const CommonVJSFOptions = computed(() => ({
      initialValidation: 'all',
      autoFixArrayItems: false,
      // disableAll: props.readonly,
    }));

    return {
      modelValid,
      basicSchema,
      basicModel,
      basicModelValid,
      complexSchema,
      complexModel,
      setComplexModelProp,
      complexModelValid,
      complexModelValidation,

      CommonVJSFOptions,

      visible: true,
    };
  },
});
</script>
