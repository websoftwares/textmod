<template>
    <div>
      <h3>{{ title }}</h3>
      <p>{{ content }}</p>
      <button class="api-key-button" @click="generateApiKey">Generate API Key</button>
      <ApiKeysTable :reload="shouldReload" @reloadChanged="handleReloadChanged" />
    </div>
  </template>
  
  <script lang="ts">
import { defineComponent, ref } from 'vue';
import ApiKeysTable from './ApiKeysTable.vue';

interface ApiKeysContentProps {
  title: string;
  content: string;
}

export default defineComponent({
  name: 'ApiKeysContent',
  components: {
    ApiKeysTable,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  setup() {
    const shouldReload = ref(false);

    async function generateApiKey() {
      try {
        const response = await fetch(`${process.env.VUE_APP_BASE_URI}/api/keys`, {
          method: 'POST',
          credentials: 'include',
        });
        if(response.ok) {
        shouldReload.value = !shouldReload.value; // Toggle the value of shouldReload to trigger a reload of the ApiKeysTable component
        }
      } catch (error) {
        console.error(error);
      }
    }

    function handleReloadChanged() {
      shouldReload.value = !shouldReload.value;
    }

    return {
      shouldReload,
      handleReloadChanged,
      generateApiKey,
    };
  },
});
</script>
  
  <style lang="scss" scoped>
  .api-key-button {
    background-color: #007bff;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
    &:hover {
      background-color: #0069d9;
    }
  }
  </style>