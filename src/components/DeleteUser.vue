<template>
    <div class="deleteUser">
        <div class="close" v-html="icons.xMark" @click="$emit('showAndHideDeleteUser', false)"></div>

        <div class="user" v-for="(user, index) in users" :key="index"  :name="user.name"
            v-show="user.email != myEmail">
            <div class="row">
                <div class="image">
                    <img :src="user.prof_img" alt="" v-if="user.prof_img">
                    <span v-html="icons.user" v-if="!user.prof_img"></span>
                </div>
                <div class="info">
                    <div class="name">{{ user.name }}</div>
                    <div class="email">{{ user.email }}</div>
                </div>
            </div>
            <div class="btn" :rowNum="user.rowIndex" :owner="user.owner"  @click="deleteUser">
                <button class="purple">حذف</button>
            </div>
        </div>
    </div>
</template>

<script>
import { getData, tb ,deleteData} from "../app/db/db.js";
import { ref } from "vue";
import iconsC from "../app/icons";
export default {
    props: ['users'],
    setup(props,{emit}) {
        const icons = iconsC;
        const myEmail = localStorage.getItem('email');

        const deleteUser = async (e)=>{
            emit('showAndHideLoader',true)
            const target = e.currentTarget;
            if(target.getAttribute('owner') == 'TRUE'){alert('لا يمكنك مسح المالك :)');emit('showAndHideLoader',false);  ;return }
            const cnfrm = confirm('هل انت متأكد من مسح المستخدم ؟')
            if(!cnfrm) {emit('showAndHideLoader',false); return;}
            const res = await deleteData({
                dbName:'Admins',
                rowNum:target.getAttribute('rowNum')
            })
            emit('getUsers');
            emit('showAndHideLoader',false)
        }
        return { icons, tb, myEmail, deleteUser }
    }
}
</script>

<style>
.deleteUser .user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 10px;
    flex-direction: row-reverse;
    margin-top: 10px;
    background-color: #fff;
}

.deleteUser .user .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row-reverse;
    width: 300px;

}

.deleteUser .user .row .info {
    width: 90%;
    padding-right: 15px;
    direction: rtl;
}

.deleteUser .user .row .info .name {
    color: darkslateblue;
}
</style>