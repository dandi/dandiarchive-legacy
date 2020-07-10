<template>
  <div>
    <v-expansion-panels>
      <template v-for="(contributor, i) in resolvedData">
        <template v-if="resolvedSchemas[i]">
          <v-expansion-panel :key="contributor.name">
            <v-expansion-panel-header>{{ contributor.name }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <object-component
                :data="contributor"
                :schema="resolvedSchemas[i]"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </template>
      </template>
    </v-expansion-panels>
  </div>
</template>

<script>
import Ajv from 'ajv';

import ObjectComponent from './Object.vue';

const ajv = new Ajv();

export default {
  name: 'Contributor',
  components: {
    ObjectComponent,
  },
  props: {
    schema: {
      // The root schema of the item to render
      type: [Object],
      required: true,
    },
    data: {
      // The data at the matching level of schema
      type: [Object, Number, String, Array],
      required: true,
    },
  },
  data() {
    return {
      resolvedSchemas: [],
      resolvedData: [],
    };
  },
  created() {
    const [resolvedData, resolvedSchemas] = this.performReplacements(this.data, this.schema.items);

    this.resolvedData = resolvedData;
    this.resolvedSchemas = resolvedSchemas;
  },
  methods: {
    performReplacements(data, schema) {
      const resolvedSchemas = this.resolveSchemas(data, schema);
      const newData = [];

      data.forEach((contributor, i) => {
        // Okay because we only deal at the root level
        const newContributor = { ...contributor };

        if (contributor.identifier) {
          // Replace identifier with identifierType as the key,
          // and the identifier itself as the value
          if (typeof contributor.identifier === 'object' && contributor.identifier !== null) {
            const { identifier, identifierType } = contributor.identifier;

            if (identifierType) {
              newContributor[identifierType] = identifier;
              delete newContributor.identifier;

              resolvedSchemas[i].properties[identifierType] = { title: identifierType };
              delete resolvedSchemas[i].identifier;
            }
          }
        }

        newData.push(newContributor);
      });

      return [newData, resolvedSchemas];
    },
    resolveSchemas(data, schema) {
      // Map each data element to the first schema that it is valid against
      const res = data.map((element) => schema.anyOf.find((s) => ajv.compile(s)(element)));
      return res;
    },
  },
};
</script>

<style>

</style>
