<template>
  <div class="userInfo">
    <div class="close" v-html="icons.xMark" @click="$emit('showAndHideUserInfo', false)"></div>
    <div class="container">
      <div class="image" @click="inpImgUpload.click()">
        <div v-html="icons.user" v-show="!prof_img"></div>
        <img :src="prof_img" v-show="prof_img" alt="profimage" title="الصوره الشخصيه">
      </div>
      <p class="name">{{ name }}</p>
      <div class="btns" >
        <button @click="$emit('getUsers')"  v-if="allow_permision">حذف مستخدم</button>
        <button @click="$emit('showAndHideCreateUser', true)" v-if="allow_permision">إنشاء مستخدم</button>
        <button @click="logOut">تسجيل الخروج</button>
      </div>
      <input type="file" style="display: none;" ref="inpImgUpload" @change="uploadImg">
    </div>
  </div>
</template>

<script>
import iconsC from "../app/icons.js";
import { ref } from "vue";
import {useRouter} from "vue-router"
export default {
  props: ['name', 'allow_permision', 'prof_img', 'owner', 'showAndHideUserInfo'],
  setup(props, { emit }) {
    const icons = iconsC;
    const router = useRouter();
    const inpImgUpload = ref(null);
    const profImageInner = props.prof_img ? `<img src="${props.prof_img}" />` : icons.user;
    const uploadImg = (e) => {
      emit('uploadImg', e.target.files[0])
    }

    const logOut = ()=>{
      localStorage.setItem('email','')
      localStorage.setItem('isLogedIn','')
      router.push('/logIn');
    }

    return { icons, inpImgUpload, uploadImg, profImageInner ,logOut }
  }
};
</script>

<style>
.userInfo .container .image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  cursor: pointer;
}

.userInfo .container .image svg {
  transform: scale(4.5);
}

.userInfo .container .btns {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
}

.userInfo .container .btns button {
  border: none;
  padding: 10px 20px;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  transition: .4s;
  background-color: #fff;
}

.userInfo .container .btns button:hover {
  color: #fff;
  background-color: darkslateblue;
}
</style>