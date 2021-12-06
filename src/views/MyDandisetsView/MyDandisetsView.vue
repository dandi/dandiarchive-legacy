<template>
  <DandisetsPage
    title="My Dandisets"
    user
  >
    <template #no-content>
      <div>
        You haven't created any dandisets yet
      </div>
    </template>
  </DandisetsPage>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import DandisetsPage from '@/components/DandisetsPage.vue';

export default defineComponent({
  name: 'MyDandisetsView',
  components: { DandisetsPage },
});
</script>
