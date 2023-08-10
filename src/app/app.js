import router from './router/router.js';
import '../assets/css/main.css';

import { createApp, ref } from 'vue/dist/vue.esm-bundler';
import { useRouter, useRoute } from 'vue-router';

const app = createApp({
    template:/*html*/`
        <router-view></router-view>
    `,
    setup() {
        const router = useRouter()
        const redirect = () => {
            if (localStorage.getItem('isLogedIn') != 'TRUE'){
                router.push('/logIn')
            }
        }
        redirect()
        // const router = useRouter() , route = useRoute();
    }
})

app.use(router).mount('#app')