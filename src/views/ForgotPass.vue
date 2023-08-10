<template>
  <div class="forgotPass">
    <form @submit.prevent="finish">
      <div class="titels">
        <div class="loader" v-show="showState.showLoader"></div>
        <h1>Forgot your password?</h1>
        <div class="desc" v-show="showState.showDesc1">{{ textsState.descText }}</div>
        <div class="warn">{{ warn }}</div>
        <div class="success">{{ success }}</div>
      </div>
      <transition name="bounce">
        <input type="text" placeholder="Email" v-show="showState.showEmail" v-model.trim="modelsState.email" />
      </transition>

      <transition name="bounce">
        <input type="text" placeholder="XXXXXXXX" :maxlength="8" v-show="showState.showNumber" v-model.trim="modelsState.code"
          ref="numInp" />
      </transition>

      <transition name="bounce">
        <input type="text" v-show="showState.showNewPass" placeholder="New password" v-model.trim="modelsState.password" />
      </transition>
      <button type="submit" @click="addClickClass">{{ textsState.btnText }}</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, warn } from "vue";
import { useRouter } from "vue-router";
import { numCode, encode, addClickClass } from "../app/cocktail.js";
import { updateData } from "../app/db/db.js";
import email from "../app/smtp.js";
import emailConfig from "../app/email.config.js";
export default {
  setup() {
    const router = useRouter();
    if (localStorage.getItem("isLogedIn") == "TRUE") {
      router.push("/");
    }

    const showState = ref({
      showLoader: false,
      showDesc1: true,
      showDesc2: false,
      showEmail: true,
      showNumber: false,
      showNewPass: false,
    });

    const textsState = ref({
      btnText: `Send Code`,
      descText: `Please enter your email that you use.`,
    });

    const modelsState = ref({
      email:null,
      code:null,
      password:null,
    })

    const numInp = ref(null);
    const warn = ref("");
    const success = ref("");
    let code = null;
    // yousef.sayed1231@gmail.com

    const sendCodeMail = () => {
      if (textsState.value.btnText != "Send Code") return;
      if (!modelsState.value.email) {
        warn.value = `Please enter your email`;
        return;
      }

      code = numCode(8);
      emailConfig.To = modelsState.value.email;
      emailConfig.Subject = "Reset password..";
      emailConfig.Body = /*html*/ `
            <h1>Welcome ${modelsState.value.email.match(/\w+/gi)[0]},</h1>
            <p>Your code is <span style="font-weight:bold;">${code}</span> , don't share it with any one .</p>
            <p>Rowaq Admin (Yousef Sayed),</p>
            <p>Thanks</p>
          `;

      email
        .send(emailConfig)
        .then(function (message) {
          console.log(message);
        });
      showState.value.showEmail = false;
      showState.value.showNumber = true;
      textsState.value.descText = `Enter the code which have sent to your email.`;
      textsState.value.btnText = `Submit`;
    };

    const submit = () => {
      if (textsState.value.btnText != "Submit") return;
      if (!modelsState.value.code) {
        warn.value = `Please enter your code`;
        return;
      }

      if (+modelsState.value.code == +code) {
        showState.value.showNumber = false;
        showState.value.showNewPass = true;
        textsState.value.descText = `Enter your new password.`;
        textsState.value.btnText = "Reset";
      } else {
        warn.value = `The code doesn't match :)`;
      }
    };

    const reset = async () => {
      if (textsState.value.btnText != "Reset") return;
      if (!modelsState.value.password) {
        warn.value = `Please enter your new password`;
        return;
      }
      showState.value.showLoader = true;
      const res = await updateData({
        dbName: "Admins",
        oldData: { email: modelsState.value.email },
        newData: { password: await encode(modelsState.value.password) },
      });

      if (res.ok) {
        showState.value.showLoader = false;
        warn.value = "";
        success.value = `You changed your password successful :)`;
        localStorage.setItem('email', modelsState.value.email);
        localStorage.setItem('isLogedIn', 'TRUE');
        setTimeout(() => {
          router.push("/logIn");
        }, 2000);
      } else {
        showState.value.showLoader = false;
        warn.value = `Sorry it is look like server issue :(`;
      }
    };

    const finish = async (e) => {
      await reset();
      submit();
      sendCodeMail();
    };



    onMounted(() => {
      numInp.value.addEventListener("input", (e) => {
        e.target.value = e.target.value.match(/\d+/gi);
        warn.value = "";
      });
    });
    // Check your email , We have sent reset code..!

    return { showState, textsState, finish,addClickClass, modelsState, numInp, warn, success };
  },
};
</script>
