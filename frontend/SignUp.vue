<template>
  <v-container class="fill-height" fluid>
    <dialog-in-app-browser />
    <v-row justify="center" class="text-center">
      <v-col cols="12" sm="8" md="4">
        <center>
          <div v-if="program">
            <vue-plyr v-if="programVideoUrl">
              <div class="plyr__video-embed">
                <iframe
                  :src="programVideoUrl"
                  allowfullscreen
                  allowtransparency
                  allow="autoplay"
                  frameborder="0"
                >
                </iframe>
              </div>
            </vue-plyr>
            <v-img
              v-else-if="programImage"
              :src="programImage.src"
              :alt="programImage.title"
              max-width="80%"
              :key="programId"
            ></v-img>
            <p v-else class="text-h3 primary--text">
              {{ programName }}
            </p>
            <p class="mt-4 mb-0">{{ programDescription }}</p>
          </div>
          <div v-else>
            <v-img
              v-if="orgBanner"
              :src="orgBanner.src"
              :alt="orgBanner.title"
              max-width="80%"
            ></v-img>
            <p v-else class="text-h3 primary--text">
              {{ orgName }}
            </p>
          </div>
        </center>
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12 pb-2">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Get Started</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div id="firebaseui-auth-container" v-if="!loading"></div>
            <div class="text-center">
              <v-progress-circular
                indeterminate
                v-if="loading"
              ></v-progress-circular>
            </div>
            <div v-if="!program" class="text-center mt-3">
              Already have an account?
              <a class="text-decoration-none" href="/signin">Sign in</a>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase, { db, auth } from "../firebase";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { uiConfig as uiConfigDefault } from "../utils/firebaseUi";
import DialogInAppBrowser from "@/components/DialogInAppBrowser";
import { parseVideoUrl } from "../utils/text";

export default {
  data: () => ({
    ui: null,
    loading: false,
  }),
  components: {
    DialogInAppBrowser,
  },
  computed: {
    orgBanner() {
      return this.$store.getters.settings.brand
        ? this.$store.getters.settings.brand.banner
        : null;
    },
    orgName() {
      return this.$store.getters.settings.name;
    },
    program() {
      // If a program id is in the URL, return the program from the store
      return this.$store.state.programs.find((program) => {
        return program.id == this.programId;
      });
    },
    programId() {
      return this.$route.params.programId;
    },
    programName() {
      return this.program?.name;
    },
    programDescription() {
      return this.program?.description;
    },
    programImage() {
      return this.program?.featuredImage;
    },
    programVideoUrl() {
      return parseVideoUrl(this.program?.featuredVideo?.url);
    },
  },
  mounted() {
    // Get program id if there is one
    const programId = this.programId;

    // Override default sign in success URL
    const uiConfig = {
      ...uiConfigDefault,
      signInSuccessUrl: "/signup-2",
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          fullLabel: "Sign up with Google",
        },
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
          fullLabel: "Sign up with email",
        },
      ],
      callbacks: {
        signInSuccessWithAuthResult: (authResult) => {
          // Only do this if there is a program id
          if (programId) {
            this.loading = true;
            const uid = authResult.user.uid;

            // Add a new document to the sign up cache
            db.collection("cache/programs/signUp")
              .doc(`${uid}_${programId}`)
              .set({
                user: {
                  id: uid,
                },
                program: {
                  id: programId,
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                processed: false,
              })
              .then(() => {
                this.loading = false;
                // Redirect to sign up step 2
                this.$router.push({ name: "Sign Up 2" });
              })
              .catch((error) => {
                if (error.code === "permission-denied") {
                  console.error(error);
                  this.$router.push({ name: "Sign Up 2" });
                } else {
                  console.error("Error adding document: ", error);
                }
              });
          } else {
            return true;
          }
          return false;
        },
      },
    };

    this.ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    this.ui.start("#firebaseui-auth-container", uiConfig);
  },
};
</script>
