import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

import VueFluent from "@creatorsn/vfluent3";
import '@creatorsn/vfluent3/style.css';

import PowerEditor from "@creatorsn/powereditor3";
import "@creatorsn/powereditor3/powereditor3.css";

const app = createApp(App)
app.use(VueFluent);

app.use(PowerEditor);

app.use(createPinia())

app.mount('#app')
