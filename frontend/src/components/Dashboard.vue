<template>
    <div>
      <LogoutButton />
      <h2>Dashboard</h2>
      <p>Welcome to the dashboard!😍</p>
    </div>
  </template>

<script lang="ts">
import { defineComponent } from 'vue';
import LogoutButton from './LogoutButton.vue';

export default defineComponent({
  components: {
    LogoutButton
  }
});
</script>