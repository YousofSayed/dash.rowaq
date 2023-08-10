<template>
    <div class="createUser">
        <div class="close" v-html="icons.xMark" @click="$emit('showAndHideCreateUser',false)"></div>
        <div class="container">
            <div class="warn">{{ warn }}</div>
            <div class="success">{{ success }}</div>
            <input type="text" placeholder="الاسم" v-model="modelsState.name">
            <input type="text" placeholder="الايميل" v-model="modelsState.email">
            <input type="text" placeholder="الرقم السري" v-model="modelsState.password">
            <div class="permision">
                <input type="checkbox" name="" id="inpPerm" v-model="modelsState.permissions">
                <label for="inpPerm">إعطاء الصلاحيات ؟</label>
            </div>
            <div class="btn"><button class="purple" @click="validation">إنشاء</button></div>
        </div>
    </div>
</template>

<script>
import { getData, setData } from "../app/db/db.js";
import { addClickClass, isValidName, isValidEmail, isValidPassword, encode } from "../app/cocktail.js";
import iconsC from "../app/icons";
import { ref } from 'vue'

export default {
    props: ['showAndHideLoader'],
    setup(props , {emit}) {

        const modelsState = ref({
            name: null,
            email: null,
            password: null,
            permissions: null,
        });
        const warn = ref(null);
        const success = ref(null);

        const validation = async (e) => {
            addClickClass(e)
            const nameV = isValidName(modelsState.value.name),
                emailV = isValidEmail(modelsState.value.email),
                passV = isValidPassword(modelsState.value.password);
            //yousef.sayed1231@gmail.com
            const vals = [nameV, emailV, passV];
            for (let i = 0; i < vals.length; i++) {
                if (vals[i].valid) {
                    warn.value = '';
                    if (+i == 2) {
                        emit('showAndHideLoader',true)
                        const res = await getData({
                            dbName: 'Admins',
                            query: `where={"email":"${modelsState.value.email}"}`,
                        })
                        warn.value = res.results[0] ? 'Email already used :(' : '';
                        if (!res.results[0]) {
                            const res2 = await setData({
                                dbName: 'Admins',
                                data: {
                                    email: modelsState.value.email,
                                    name: modelsState.value.name,
                                    password: await encode(modelsState.value.password),
                                    allow_permision : modelsState.value.permissions,
                                    owner:false,
                                }
                            });
                            warn.value = res2 ? '' : 'Server Error';
                            success.value = res2 ? 'User created seccessful :)' : '';
                        }
                        emit('showAndHideLoader',false)

                    }
                    continue;
                } else {
                    warn.value = vals[i].msg;
                    break;
                }
            }
        }
        const icons = iconsC;
        return { icons, modelsState, addClickClass, validation, warn ,success }
    }
}

</script>

<style>
.createUser .container input[type="text"] {
    padding: 10px;
    border: none;
    border-bottom: 1.5px solid darkslateblue;
    background-color: #fff;
    color: #000;
    text-align: right;
    transition: .2s;
    width: 400px;
}

.createUser .container input[type="text"]:focus {
    transform: scale(1.1);
    outline: darkslateblue solid 1px;
    border: none;
}

.createUser .container .permision,
.createUser .container .btn {
    display: flex;
    gap: 10px;
    align-items: center;
    width: 400px;
    justify-content: flex-end;
    font-weight: bold;
    font-size: 20px;
}

@media (max-width:510px) {
    .createUser .container .permision,
    .createUser .container .btn,
    .createUser .container input[type="text"] {
        width: 100%;
    }
}
</style>