import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}

app.mount('#app');
