<template>
    <div class="login-form">
        <h2>Login</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" v-model.trim="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" v-model.trim="password" required>
            </div>
            <div class="form-group">
                <label for="repeat-password">Repeat Password:</label>
                <input type="password" id="repeat-password" v-model.trim="repeatPassword" required>
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';

interface LoginFormData {
[x: string]: any;
    email: string;
    password: string;
    repeatPassword: string;
}

export default defineComponent({
    data(): LoginFormData {
        return {
            email: '',
            password: '',
            repeatPassword: ''
        };
    },
    methods: {
        async handleSubmit(this: LoginFormData): Promise<void> {
            if (this.password !== this.repeatPassword) {
                alert('Passwords do not match');
                return;
            }

            try {
                const response = await fetch(`${process.env.VUE_APP_BASE_URI}/api/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password
                    }),
                    credentials: 'include'
                });

                if (!response.ok) {
                    const { error } = await response.json();
                    throw new Error(error);
                }


                await this.$router.push('/dashboard');

            } catch (errors) {
                const err = errors as Error;
                console.log(err.message)
                alert('Failed to login');
            }
        }
    }
});
</script>
  
<style lang="scss" scoped>
.login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;

    .form-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;

        label {
            margin-bottom: 5px;
        }

        input[type="email"],
        input[type="password"] {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }
    }

    button[type="submit"] {
        background-color: #007bff;
        color: #fff;
        padding: 10px 20px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
    }
}
</style>