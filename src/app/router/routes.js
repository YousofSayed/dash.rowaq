import Home from '../../views/Home.vue';
import CreateUser from '../../views/CreateUser.vue';
import LogIn from '../../views/LogIn.vue';
import ForgotPass from '../../views/ForgotPass.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/signUp', component: CreateUser },
    { path: '/logIn', component: LogIn },
    { path: '/forgotPass', component: ForgotPass },
]

export default routes;