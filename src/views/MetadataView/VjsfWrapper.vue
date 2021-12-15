<template>
  <v-row>
    <v-col
      style="max-height: 80vh;"
      class="overflow-y-auto"
      cols="6"
    >
      <v-form v-if="schemaTypes.length">
        <v-select
          outlined
          label="Type"
          :items="schemaTypes"
          :value="value.schemaKey"
          @change="setType($event)"
        />
      </v-form>
      <v-jsf
        :value="value"
        :schema="schema"
        :options="extendedOptions"
        @input="setComplexModelProp(propKey, $event)"
      />
    </v-col>

    <v-col
      style="max-height: 80vh;"
      class="overflow-y-auto"
    >
      <v-jsf
        :value="editorInterface.complexModel[propKey]"
        :schema="editorInterface.complexSchema.properties[propKey]"
        :options="options"
      >
        <template slot-scope="slotProps">
          <v-card
            outlined
            class="d-flex flex-column"
          >
            <draggable
              @update="setComplexModelProp(slotProps)"
            >
              <v-card
                v-for="(item, i) in slotProps.value"
                :key="i"
                outlined
              >
                <div class="pa-3 d-flex align-center justify-space-between">
                  <span>
                    {{ item.name || item.identifier || item.id }}
                  </span>
                  <span>
                    <span>
                      <v-btn
                        text
                        small
                      >
                        <v-icon
                          color="error"
                          left
                        >
                          mdi-minus-circle
                        </v-icon>
                        <span class="font-weight-regular">
                          Remove
                        </span>
                      </v-btn>
                    </span>
                    <span>
                      <v-btn
                        text
                        small
                        @click="index=i"
                      >
                        <v-icon
                          color="info"
                          left
                        >
                          mdi-pencil
                        </v-icon>
                        <span class="font-weight-regular">
                          Edit
                        </span>
                      </v-btn>
                    </span>
                  </span>
                </div>
              </v-card>
            </draggable>
          </v-card>
        </template>
      </v-jsf>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, PropType, Ref,
} from '@vue/composition-api';

import VJsf from '@koumoul/vjsf/lib/VJsf';
import '@koumoul/vjsf/lib/deps/third-party';
import '@koumoul/vjsf/lib/VJsf.css';
import { EditorInterface } from '@/utils/schema/editor';
import { DandiModel } from '@/utils/schema/types';

export default defineComponent({
  name: 'VjsfWrapper',
  components: { VJsf },
  props: {
    editorInterface: {
      type: Object as PropType<EditorInterface>,
      required: true,
    },
    propKey: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const index = ref(-1);
    const newItem: Ref<any> = ref({});

    const extendedOptions = computed(() => ({ childrenClass: 'my-1', ...props.options }));

    const isArray = computed(() => (props.editorInterface.complexSchema?.properties?.[props.propKey] as any).type === 'array');

    const needsSubschema = computed(() => {
      const { items } = (props.editorInterface.complexSchema?.properties?.[props.propKey] as any);
      for (const prop of ['allOf', 'anyOf', 'oneOf']) {
        if (Object.keys(items).includes(prop)) {
          return true;
        }
      }
      return false;
    });

    const schemaTypes = computed(() => {
      const currentSchema: any = props.editorInterface.complexSchema?.properties?.[props.propKey];

      const types: string[] = [];

      if (currentSchema) {
        ['allOf', 'anyOf', 'oneOf'].forEach((type: string) => {
          if (Object.keys(currentSchema.items).includes(type)) {
            types.push(...currentSchema.items[type].map((t: any) => t.title));
          }
        });
      }
      return types;
    });

    const value = computed(() => {
      if (isArray.value) {
        if (index.value < 0) {
          const type = schemaTypes.value.length ? schemaTypes.value[0] : props.propKey;

          if (schemaTypes.value.length) {
            newItem.value = {
              ...props.editorInterface.complexSchema?.definitions?.[type].properties,
            };
          } else {
            newItem.value = {
              ...props.editorInterface.complexSchema?.properties?.[type].items.properties,
            };
          }
          for (const key in newItem.value) {
            switch (newItem.value[key].type) {
              case 'array':
                newItem.value[key] = [];
                break;
              case 'string':
                newItem.value[key] = '';
                break;
              case 'object':
                newItem.value[key] = {};
                break;
              default:
                newItem.value[key] = null;
                break;
            }
          }

          newItem.value.schemaKey = type;
          return newItem.value;
        }
        return (props.editorInterface.complexModel as any)[props.propKey][index.value];
      }
      return props.editorInterface.complexModel[props.propKey];
    });

    const schema = computed(() => {
      const { complexSchema } = props.editorInterface as any;
      if (needsSubschema.value) {
        return complexSchema?.definitions?.[value.value.schemaKey];
      }
      return complexSchema?.properties?.[props.propKey].items;
    });

    function setComplexModelProp(propKey: string, event: DandiModel): void {
      // @ts-ignore
      if (isArray.value) {
        const currentValue = [...(props.editorInterface.complexModel[propKey] as any)];
        if (index.value >= 0) {
          currentValue[index.value] = { ...(currentValue[index.value] as DandiModel), ...event };
        } else {
          index.value = currentValue.push(event) - 1;
        }
        props.editorInterface.setComplexModelProp(propKey, currentValue as any);
      } else {
        props.editorInterface.setComplexModelProp(propKey, event);
      }
    }

    function setType(type: string) {
      setComplexModelProp(props.propKey, { ...value.value, schemaKey: type });
    }

    return {
      index,
      extendedOptions,
      setComplexModelProp,
      setType,
      value,
      schema,
      schemaTypes,
      isArray,
    };
  },
});
</script>
