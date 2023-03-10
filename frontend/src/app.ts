import './assets/scss/styles.scss'
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue';
import Signup from './components/Signup.vue';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Dashboard from './components/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/signup', component: Signup },
    { path: '/login', component: Login },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true // This meta field tells the router that this route requires authentication
      },
      beforeEnter: async (to, from, next) => {
        try {
          const response = await fetch(`${process.env.VUE_APP_BASE_URI}/api/users/protected`, { credentials: 'include' })
          if (response.ok) {
            // If the response is successful, the user is authenticated, so continue to the route component
            next()
          } else {
            // If the response is unsuccessful, the user is not authenticated, so redirect to the login page
            next('/login')
          }
        } catch (error) {
          // If there is an error, redirect to the login page
          next('/login')
        }
      }
    }
  ]
});

const app = createApp(App);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}

// Use the router instance in the app instance
app.use(router);

// Mount the app to the DOM
app.mount('#app');