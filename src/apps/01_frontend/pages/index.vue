<template>
  <v-app id="inspire">
    <v-app-bar app>
      <router-link to="/">
        <U2wareAvatar></U2wareAvatar>
      </router-link>

      <v-toolbar-title> {{ $t("frontend.index.title") }} </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn text variant="elevated" color="error" @click="start">
        <v-icon>mdi-account</v-icon> 시작하기
      </v-btn>
    </v-app-bar>

    <U2wareFooter></U2wareFooter>

    <v-main>

      <!-- {{ e1 }}
      {{ e2 }}
      {{ e3 }}
      {{ e4 }}   -->

    </v-main>
  </v-app>


</template>

<script>
const x = "[/]";
import $oauth2Server from "@@/assets/apis/oauth2-server";

export default {
  data: () => ({

    e1 : import.meta.env.VITE_OAUTH2_SERVER,
    e2 : import.meta.env.VITE_STOMP_SERVER,
    e3 : import.meta.env.VITE_STOMP_DESTINATION,
    e4 : import.meta.env.VITE_EXAMPLE_SERVER,

  }),

  computed: {

  },

  methods: {
    start() {
      
      $oauth2Server.oauth2
        .available()
        .then((r) => {
          console.log(x, "start()", 1, r);
          if(true == r) {
            return $oauth2Server.oauth2.userinfo()
          }
        })
        .then((r) => {
          console.log(x, "start()", 2, r);
          this.$router.push(`/contents`);
        })
        .catch((r) => {
          console.log(x, "start()", 3, r);
          this.$router.push(`/accounts/login`);
        });
    },
  },

  watch: {},

  mounted() {


  },
};
</script>