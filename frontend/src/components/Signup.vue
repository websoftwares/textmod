<template>
  <form>
    <label>
      Username:
      <input type="text" v-model="user.username">
    </label>
    <label>
      Email:
      <input type="email" v-model="user.email">
    </label>
    <label>
      Password:
      <input type="password" v-model="user.password">
    </label>
    <button @click.prevent="signup">Sign up</button>
  </form>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { User } from '@/types';

export default defineComponent({
  data() {
    return {
      user: {
        username: '',
        password: '',
        email: ''
      } as User
    };
  },
  methods: {
    async signup() {
      // validate input fields
      if (!this.validateUsername(this.user.username)) {
        alert('Username must contain only letters and numbers');
        return;
      }
      if (!this.validateEmail(this.user.email)) {
        alert('Email is not valid');
        return;
      }
      if (!this.validatePassword(this.user.password)) {
        alert('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        return;
      }
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.user),
        redirect: 'follow'
      };

      try {
        const response = await fetch(`${process.env.VUE_APP_BASE_URI}/api/users`, requestOptions);
        if (!response.ok) {
          throw new Error(`Failed to sign up user: ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
        alert('User signed up successfully!');
      } catch (error) {
        console.log('error', error);
        alert('An error occurred while signing up the user.');
      }
    },
    validateUsername(username: string) {
      const pattern = /^[a-zA-Z0-9]+$/;
      return pattern.test(username);
    },
    validateEmail(email: string) {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(email);
    },
    validatePassword(password: string) {
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return pattern.test(password);
    }
  }
});
</script>