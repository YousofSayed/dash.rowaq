<template>
  <div class="logIn">
    <form @submit.prevent="logIn">
      <div class="loader" v-show="showLoader"></div>
      <div class="title">Login</div>
      <div class="warn">{{ warn }}</div>
      <div class="success">{{ success }}</div>
      <div class="inpsAndbtns">
        <input type="text" placeholder="Email" v-model.trim="modelsState.emailModel" />
        <input type="password" placeholder="Password" v-model.trim="modelsState.passwordModel" />
        <button type="submit" @click="logIn">Login</button>
      </div>
      <button @click.prevent="redirectToForgotPass">Forgot password ?</button>
    </form>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, warn } from "vue";
import { getData } from "../app/db/db.js";
import { addClickClass, encode } from "../app/cocktail.js";
import Email from "../app/smtp";
import emailConfig from "../app/email.config";

export default {
  setup() {
    const router = useRouter();
    if (localStorage.getItem("isLogedIn") == "TRUE") {
      router.push("/");
    }
    const modelsState = ref({
      emailModel: null,
      passwordModel: null,
    });

    const showLoader = ref(false)

    const warn = ref("");
    const success = ref("");

    const logIn = async (e) => {
      console.log(modelsState.value.emailModel);
      addClickClass(e)
      try {
        showLoader.value = true;
        warn.value = "";
        success.value = "";
        const res = await getData({
          dbName: "Admins",
          query: `where={"email":"${modelsState.value.emailModel}"}`,
        });


        if (
          res?.results &&
          res?.results.length == 1 &&
          res?.results[0]?.password === (await encode(modelsState.value.passwordModel))
        ) {
          warn.value = "";
          success.value = "You loged in successful :)";
          localStorage.setItem("isLogedIn", "TRUE");
          localStorage.setItem('email', modelsState.value.emailModel)
          showLoader.value = false;
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          showLoader.value = false;
          success.value = "";
          warn.value = `Email or password is wrong :(`;
        }
      } catch (error) {
        showLoader.value = false; 
        warn.value = `Sorry it is look like server issue :(`;
        emailConfig.To = "yousef.sayed1231@gmail.com";
        emailConfig.Subject = "Database issue..";
        emailConfig.Body = /*html*/ `
            <h1>There is issue in rowaq admins database</h1>
          `;

        Email.send(emailConfig);
        throw new Error(error.message);
      }
    };

    const redirectToForgotPass = () => {
      router.push("/forgotPass");
    };

    return { redirectToForgotPass, showLoader, modelsState, warn, success, logIn };
  },
};
</script>


<style>
.loader {
  right: 20px;
}
</style>