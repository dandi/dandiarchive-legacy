<template>
  <div>
    <v-row>
      <v-snackbar
        v-model="invalidPermissionSnackbar"
        top
        :timeout="2000"
        color="error"
      >
        Save Failed: Insufficient Permissions
        <v-btn
          icon
          @click="invalidPermissionSnackbar = false"
        >
          <v-icon color="white">
            mdi-close-circle
          </v-icon>
        </v-btn>
      </v-snackbar>

      <v-col>
        <v-card
          class="mb-2"
          outlined
        >
          <v-card-title>
            <v-tooltip top>
              <template #activator="{ on }">
                <v-icon
                  left
                  :color="allModelsValid ? 'success' : 'error'"
                  v-on="on"
                >
                  <template v-if="allModelsValid">
                    mdi-checkbox-marked-circle
                  </template>
                  <template v-else>
                    mdi-alert-circle
                  </template>
                </v-icon>
              </template>
              <template v-if="allModelsValid">
                All metadata for this dandiset is valid.
              </template>
              <template v-else>
                There are errors in the metadata for this Dandiset.
              </template>
            </v-tooltip>
            {{ basicModel.name }}
          </v-card-title>
          <v-card-actions class="pt-0">
            <v-btn
              icon
              @click="exitMeditor"
            >
              <v-icon>mdi-home</v-icon>
            </v-btn>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
                  icon
                  :color="modified ? 'warning' : 'primary'"
                  :disabled="readonly"
                  v-on="on"
                  @click="save"
                >
                  <v-icon
                    v-text="modified ? 'mdi-content-save-alert' : 'mdi-content-save'"
                  />
                </v-btn>
              </template>
              <span>Save</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
                  icon
                  color="secondary"
                  :disabled="disableUndo"
                  v-on="on"
                  @click="undoChange"
                >
                  <v-icon>
                    mdi-undo
                  </v-icon>
                </v-btn>
              </template>
              <span>Undo</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
                  icon
                  color="secondary"
                  :disabled="disableRedo"
                  v-on="on"
                  @click="redoChange"
                >
                  <v-icon>
                    mdi-redo
                  </v-icon>
                </v-btn>
              </template>
              <span>Redo</span>
            </v-tooltip>
            <v-spacer />
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  @click="download"
                >
                  <v-icon>
                    mdi-download
                  </v-icon>
                </v-btn>
              </template>
              <span>Download Metadata</span>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="px-2">
      <v-tabs
        v-model="tab"
        background-color="grey darken-2"
        slider-color="highlight"
        dark
        centered
      >
        <v-tab
          key="tab-0"
          class="font-weight-medium text-caption"
        >
          General
        </v-tab>
        <v-tab
          v-for="(propKey, i) in Object.keys(complexSchema.properties)"
          :key="`tab-${i+1}`"
          class="font-weight-medium text-caption"
        >
          {{ complexSchema.properties[propKey].title || propKey }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item key="tab-0">
          <v-form
            ref="basic-form"
            v-model="basicModelValid"
            class="px-7 py-5"
          >
            <v-jsf
              ref="basicRef"
              v-model="basicModel"
              :schema="basicSchema"
              :options="{...CommonVJSFOptions, hideReadOnly: true}"
              @change="basicFormListener"
            />
          </v-form>
        </v-tab-item>
        <v-tab-item
          v-for="(propKey, i) in Object.keys(complexSchema.properties)"
          :key="`tab-${i+1}`"
        >
          <v-card class="pa-2 px-4">
            <v-form
              :ref="`${propKey}-form`"
              v-model="complexModelValidation[propKey]"
              class="px-7"
            >
              <vjsf-wrapper
                :prop-key="propKey"
                :editor-interface="editorInterface"
                :options="CommonVJSFOptions"
              />
            </v-form>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-row>
    <v-divider class="my-5" />
    <v-row class="px-2" />
    <v-row
      v-if="exiting && modified"
      justify="center"
    >
      <v-dialog
        v-model="exiting"
        max-width="290"
      >
        <v-card>
          <v-card-title class="text-h5">
            Warning
          </v-card-title>
          <v-card-text>You have unsaved changes. Would you still like to exit?</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="green darken-1"
              text
              @click="exiting = false"
            >
              No
            </v-btn>
            <v-btn
              color="green darken-1"
              text
              @click="closeEditor"
            >
              Yes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script lang="ts">
import type { JSONSchema7 } from 'json-schema';

import {
  defineComponent, PropType, ref, computed, nextTick, Ref,
} from '@vue/composition-api';

import jsYaml from 'js-yaml';

import VJsf from '@koumoul/vjsf/lib/VJsf';
import '@koumoul/vjsf/lib/deps/third-party';
import '@koumoul/vjsf/lib/VJsf.css';

import { dandiRest } from '@/rest';
import store from '@/store';
import { DandiModel, isJSONSchema } from '@/utils/schema/types';
import { EditorInterface } from '@/utils/schema/editor';
import MeditorTransactionTracker from '@/utils/transactions';
import { Location } from 'vue-router';

import VjsfWrapper from '@/views/MetadataView/VjsfWrapper.vue';

function renderField(fieldSchema: JSONSchema7) {
  const { properties } = fieldSchema;

  if (fieldSchema.readOnly) { return false; }
  const allSubPropsReadOnly = properties !== undefined && Object.keys(properties).every(
    (key) => {
      const subProp = properties[key];
      return isJSONSchema(subProp) && subProp.readOnly;
    },
  );

  if (allSubPropsReadOnly) { return false; }
  return true;
}

export default defineComponent({
  name: 'Meditor',
  components: { VJsf, VjsfWrapper },
  props: {
    schema: {
      type: Object as PropType<JSONSchema7>,
      required: true,
    },
    model: {
      type: Object as PropType<DandiModel>,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, ctx) {
    const { model: modelProp, schema: schemaProp } = props;
    const invalidPermissionSnackbar = ref(false);
    const tab = ref(null);

    const editorInterface = new EditorInterface(schemaProp, modelProp);
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

    function sectionButtonColor(propKey: string) {
      const sectionValid = complexModelValidation[propKey];
      if (sectionValid !== undefined && !sectionValid) {
        return 'error';
      }

      return undefined;
    }

    const CommonVJSFOptions = computed(() => ({
      initialValidation: 'all',
      autoFixArrayItems: false,
      disableAll: props.readonly,
      fieldProps: {
        outlined: true,
      },
      arrayItemCardProps: {
        outlined: true,
      },
      editMode: 'inline',
      hideReadOnly: true,
    }));
    const currentDandiset = computed(() => store.state.dandiset.dandiset);
    const id = computed(() => currentDandiset.value?.dandiset.identifier);

    const basicRef: Ref<any> = ref(null);
    const complexRef: Ref<any> = ref(null);

    const TransactionTracker = new MeditorTransactionTracker(editorInterface);

    const closeEditor = () => {
      const newRoute: Location = {
        name: 'dandisetLanding',
        params: {
          identifier: id.value || '',
          version: currentDandiset.value?.version || '',
        },
      };
      ctx.root.$router.push(newRoute);
    };

    const undoChange = () => {
      // Undo the change and then trigger revalidation of the form. The return value of undo()
      // indicates whether this was a basic or complex form change.
      if (TransactionTracker.undo()) {
        nextTick().then(() => complexRef.value.forEach((formRef: any) => formRef.validate()));
      } else {
        nextTick().then(() => basicRef.value.validate());
      }
    };

    const redoChange = () => {
      // Redo the change and then trigger revalidation of the form. The return value of redo()
      // indicates whether this was a basic or complex form change.
      if (TransactionTracker.redo()) {
        nextTick().then(() => complexRef.value.forEach((formRef: any) => formRef.validate()));
      } else {
        nextTick().then(() => basicRef.value.validate());
      }
    };

    const disableUndo = computed(
      () => props.readonly || !TransactionTracker.areTransactionsBehind(),
    );
    const disableRedo = computed(
      () => props.readonly || !TransactionTracker.areTransactionsAhead(),
    );

    const basicFormListener = () => TransactionTracker.add(basicModel.value, false);
    const complexFormListener = () => TransactionTracker.add(complexModel, true);

    const modified = computed(() => TransactionTracker.isModified());

    const exiting = ref(false);
    const exitMeditor = () => {
      if (modified.value) {
        exiting.value = true;
        return;
      }
      closeEditor();
    };

    async function save() {
      if (!id.value || !currentDandiset.value?.version) {
        return;
      }
      const dandiset = editorInterface.getModel();

      try {
        const { status, data } = await dandiRest.saveDandiset(
          id.value, currentDandiset.value.version, dandiset,
        );

        if (status === 200) {
          // wait 0.5 seconds to give the celery worker some time to finish validation
          setTimeout(async () => {
            await store.dispatch.dandiset.fetchDandiset({
              identifier: data.dandiset.identifier,
              version: data.version,
            });
            TransactionTracker.reset();
          }, 500);
        }
      } catch (error) {
        if (error.response.status === 403) {
          invalidPermissionSnackbar.value = true;
        }

        throw error;
      }
    }

    // TODO: Add back UI to toggle YAML vs JSON
    const yamlOutput = ref(false);
    const contentType = computed(() => (yamlOutput.value ? 'text/yaml' : 'application/json'));
    const output = computed(() => {
      const model = editorInterface.getModel();
      return yamlOutput.value ? jsYaml.dump(model) : JSON.stringify(model, null, 2);
    });

    function download() {
      const blob = new Blob([output.value], { type: contentType.value });

      const extension = contentType.value.split('/')[1];
      const filename = `dandiset.${extension}`;
      const link = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }

    return {
      allModelsValid: modelValid,
      tab,

      basicSchema,
      basicModel,
      basicModelValid,
      basicRef,
      basicFormListener,

      complexSchema,
      complexModel,
      complexModelValid,
      complexModelValidation,
      complexRef,
      complexFormListener,

      invalidPermissionSnackbar,
      renderField,
      closeEditor,
      save,
      download,
      sectionButtonColor,

      modified,
      exiting,
      exitMeditor,

      undoChange,
      redoChange,
      disableUndo,
      disableRedo,

      CommonVJSFOptions,

      setComplexModelProp,

      TransactionTracker,
      editorInterface,
    };
  },
});
</script>
