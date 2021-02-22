<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" class="mt-12">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Almost there!</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>
              We just need a few more things before we can start your program.
            </p>
            <div v-if="user">
              <v-form v-model="valid" ref="form">
                <v-text-field
                  label="First name"
                  prepend-icon="mdi-account"
                  v-model="firstName"
                  :rules="[rules.required, rules.maxLength, rules.blank]"
                  required
                />

                <div style="display: flex">
                  <v-icon>mdi-phone</v-icon>
                  <vue-tel-input-vuetify
                    v-model="user.phone"
                    label="Mobile phone (optional)"
                    hint="So you can get SMS reminders (US and Canada only)"
                    placeholder=""
                    :onlyCountries="['US', 'CA']"
                    mode="international"
                    validCharactersOnly
                    class="ml-2"
                    style="flex-grow: 1"
                  ></vue-tel-input-vuetify>
                </div>

                <v-autocomplete
                  :items="ianaTimezones"
                  v-model="timezone"
                  prepend-icon="mdi-clock"
                  :rules="[rules.required]"
                  label="Timezone"
                  hint="Adjusts each program to work around your schedule."
                  required
                ></v-autocomplete>
              </v-form>
            </div>
            <div v-else class="text-center">
              <v-progress-circular indeterminate></v-progress-circular>
            </div>
          </v-card-text>
          <v-card-actions v-if="user" class="pb-4 justify-center">
            <v-btn
              @click="submitForm"
              color="primary"
              large
              :loading="loading"
              :disabled="loading"
            >
              Finish
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase, { db } from "../firebase";
import { ianaTimezones } from "../utils/timezones";

export default {
  data: () => ({
    valid: false,
    ianaTimezones: ianaTimezones,
    loading: false,
    rules: {
      required: (v) => !!v || "Required",
      email: (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid e-mail.";
      },
      maxLength: (v) => v.length <= 30 || "Must be less than 30 characters",
      blank: (v) => (v && !!v.trim()) || "Must not be blank",
    },
  }),
  computed: {
    user() {
      return this.$store.state.user;
    },
    firstName: {
      get() {
        const displayName = this.$store.getters.auth.displayName;
        return (
          this.user.firstName || (displayName ? displayName.split(" ")[0] : "")
        );
      },
      set(newValue) {
        this.user.firstName = newValue;
      },
    },
    timezone: {
      get() {
        return (
          this.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        );
      },
      set(newValue) {
        this.user.timezone = newValue;
      },
    },
  },
  created() {
    // Bind User
    const uid = this.$store.getters.auth.uid;
    this.$store.dispatch("bindUser", { ref: db.doc(`users/${uid}`) });
  },
  methods: {
    submitForm() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        db.doc(`users/${this.user.id}`)
          .update({
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            firstName: this.firstName,
            phone: this.user.phone,
            timezone: this.timezone,
            "notifications.sms.enabled": !!this.user.phone,
          })
          .then(() => {
            this.loading = false;
            this.$router.push({ name: "Dashboard" });
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
          });
      }
    },
  },
};
</script>
