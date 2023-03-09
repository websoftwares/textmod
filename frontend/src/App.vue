<template>
  <div class="my-component">
    <h1>{{ message }}</h1>
  </div>
</template>

<style lang="scss">
.my-component {
  background-color: $primary-color;
}

</style>

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
