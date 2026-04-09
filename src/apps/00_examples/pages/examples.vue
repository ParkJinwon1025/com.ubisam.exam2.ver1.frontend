<template>
  <v-app id="inspire">
  <vue3-confirm-dialog persistent></vue3-confirm-dialog>
    <v-app-bar app>
      <router-link to="/">
        <U2wareAvatar></U2wareAvatar>
      </router-link>

      <v-toolbar-title> Plugins Test </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- <v-btn text variant="elevated" color="error" @click="start">
        <v-icon>mdi-account</v-icon> {{ $t("app.bar.start") }} 
      </v-btn> -->
     
    </v-app-bar>

    <U2wareFooter></U2wareFooter>

    <v-navigation-drawer permanent v-model="drawer">
      <v-list nav>
        <v-list-item to="/examples/moment"> moment </v-list-item>
        <v-list-item to="/examples/locales"> locales </v-list-item>
        <v-list-item to="/examples/dialog"> dialog </v-list-item>
        <v-list-item to="/examples/storeSet"> Store Set  </v-list-item>
        <v-list-item to="/examples/storeGet"> Store Get </v-list-item>
        <v-list-item to="/examples/autocomplate"> autocomplate </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>



</template>

<script>

import $stompjs from "stompjs";

export default {

  data: () => ({
    drawer: true,
  }),

  mounted() {

  },

  methods : {

    }



  



};
</script>
