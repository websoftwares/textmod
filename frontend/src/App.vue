<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface ComponentData {
  message: string;
}

export default defineComponent({
  data(): ComponentData {
    return {
      message: 'Hello, Vue.js!'
    };
  }
});
</script>
