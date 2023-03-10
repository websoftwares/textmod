import './assets/scss/styles.scss'
import {createApp} from 'vue';
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue';
import Signup from './components/Signup.vue';
import Home  from './components/Home.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/signup', component: Signup }
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