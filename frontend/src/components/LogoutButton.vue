<template>
    <button @click="logout">Logout</button>
  </template>

<style scoped lang="scss">
button {
  background-color: #FFA500; /* Orange yellow */
  border: none;
  color: white;
  padding: 8px 20px; /* Updated padding */
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px; /* Updated font-size */
  margin: 4px 2px;
  cursor: pointer;
}

button:hover {
  background-color: #FF8C00; /* Darker shade of orange yellow */
}

button:active {
  background-color: #FF8C00; /* Darker shade of orange yellow */
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}
</style>
  
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
  