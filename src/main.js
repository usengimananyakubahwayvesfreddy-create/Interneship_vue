import { createApp } from 'vue';
import App from './App.vue';
import store from './store'; // Imports the index.js store file automatically

const app = createApp(App);

app.use(store); // Registers Vuex
app.mount('#app');
