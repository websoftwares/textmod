<template>
    <div>
      <h3>{{ title }}</h3>
      <p>{{ content }}</p>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  interface UserProfileContentProps {
    title: string;
    content: string;
  }
  
  export default defineComponent({
    name: 'UserProfileContent',
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
  });
  </script>
  
  <style scoped>
  /* Styles for the MyContent component go here */
  </style>