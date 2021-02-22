<template>
  <v-container class="fill-height" fluid>
    <dialog-in-app-browser />
    <v-row justify="center" class="text-center">
      <v-col cols="12" sm="8" md="4">
        <center>
          <v-img
            v-if="banner"
            :src="banner.src"
            :alt="banner.title"
            max-width="80%"
          ></v-img>
          <p v-else class="text-h3 primary--text">
            {{ name }}
          </p>
        </center>
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12 pb-2">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Sign In</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div class="text-center mb-3">
              Don't have an account yet?
              <a class="text-decoration-none" href="/signup">Sign up</a>
            </div>
            <div id="firebaseui-auth-container"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { auth } from "../firebase";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import uiConfig from "../utils/firebaseUi";
import DialogInAppBrowser from "@/components/DialogInAppBrowser";

export default {
  data: () => ({
    ui: null,
  }),
  components: {
    DialogInAppBrowser,
  },
  computed: {
    banner() {
      return this.$store.getters.settings.brand
        ? this.$store.getters.settings.brand.banner
        : null;
    },
    name() {
      return this.$store.getters.settings.name;
    },
  },
  mounted() {
    this.ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    this.ui.start("#firebaseui-auth-container", uiConfig);
  },
};
</script>
