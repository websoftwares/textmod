<template>
    <button @click="logout">Logout</button>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    setup() {
      const router = useRouter();
  
      async function logout(): Promise<void> {
        try {
          const response = await fetch(`${process.env.VUE_APP_BASE_URI}/api/users/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('Failed to logout');
          }
          await router.push('/login');
        } catch (error) {
          console.error(error);
          // handle the error, e.g. show an error message to the user
        }
      }
  
      return {
        logout
      };
    }
  });
  </script>
  