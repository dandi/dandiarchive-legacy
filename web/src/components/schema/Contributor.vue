<template>
  <div>
    <v-expansion-panels>
      <template v-for="(contributor, i) in data">
        <template v-if="resolvedSchemas[i]">
          <v-expansion-panel :key="contributor.name">
            <v-expansion-panel-header>{{ contributor.name }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list dense>
                <v-list-item
                  v-for="(item, contributorKey) in contributor"
                  :key="contributorKey"
                  dense
                >
                  <template v-if="Array.isArray(item)">
                    <strong class="mr-2">
                      {{ resolvedSchemas[i].properties[contributorKey].title }}:
                    </strong>
                    {{ item.join(', ') }}
                  </template>
                  <template v-else-if="typeof item === 'object'">
                    <object-component :data="item" />
                  </template>
                  <template v-else>
                    <strong class="mr-2">
                      {{ resolvedSchemas[i].properties[contributorKey].title }}:
                    </strong>
                    {{ item }}
                  </template>
                </v-list-item>
              </v-list>
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
  computed: {
    resolvedSchemas() {
      return this.resolveSchema(this.schema.items, this.data);
    },
  },
  methods: {
    performReplacements(data, schema) {
      const resolvedSchemas = this.resolveSchema(data, schema);
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
    resolveSchema(data, schema) {
      // Could be made recursive to resolve nested 'anyOf'
      const res = data.map((element) => schema.anyOf.find((s) => ajv.compile(s)(element)));
      return res;
    },
  },
};
</script>

<style>

</style>
