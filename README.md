# Background
This is the sign up flow for [Firebuilders.io](http://firebuilders.io). While the core logic of the sign up process should be familiar, there are some advanced features needed for giving access to a given Firebuilders program. A program is essentially an interactive course delivered by email every few days.

While the code itself cannot be compiled or run from this sample repository, you can view a fully functional live demo at the link below. The demo Firebuilders program is written in the voice of [Ernest Hemingway](https://en.wikipedia.org/wiki/Ernest_Hemingway).

## Demo
https://demo.firebuilders.io/signup/YwkSELm4FMv7b1YuwJQw

# Core Technologies

- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [FirebaseUI](https://firebase.google.com/docs/auth/web/firebaseui)
- [TypeScript](https://www.typescriptlang.org/)
- [Vue](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/en/)
- [Vuex](https://vuex.vuejs.org/)
- [Vuexfire](https://vuefire.vuejs.org/vuexfire/)
- [Vue Router](https://router.vuejs.org/)

The demo is hosted on [Firebase Hosting](https://firebase.google.com/docs/hosting) and automatically deployed with [Cloud Build](https://cloud.google.com/build) after a new release is published.

# File Descriptions

## Frontend (Vue)
**SignIn.vue**

Basic sign in page for existing users.

**SignUp.vue**

Sign up page that defaults to the general sign up page for an organization (vs a specific program). This lets a user sign up for an account, but does not provide access to any programs. If there is a program id in the URL, the user is granted access to that specific program only. This special program sign up URL only works once (in the case that a user's access is removed in the future). If a user is already logged in, and they visit this special program access URL, they will automatically get access to the program without having to sign in again, but only the first time. See *cache.ts* for more details.

**SignUp2.vue**

The second step in the sign up process. After waiting for the User object to be created in the database (1-2 seconds), a user's timezone is automatically detected, and name is populated, if available. After the form is submitted, the User document is updated with the user's name, phone, and timezone. The timezone is needed to send emails in the user's local time (e.g. every Monday at 8 am local time).

**firebaseUi.ts**

Default FirebaseUI config object that is shared between the sign in and sign up pages.

## Backend (Cloud Functions)
**auth.ts**

Cloud function that triggers when a Firebase Auth user is created. It adds a User document to the Firestore database (this is the function that *signUp2.vue* waits on).

**authHelpers.ts**

Helper functions for user authentication and sign up.

**cache.ts**

Cloud function that triggers when a Program Cache document is created. If the program exists, the User document is updated with the id of the program that they just signed up for. If it does not exist, the User is not updated. This cache ensures that a special program sign up link can only be used once by a given user.

**apiRetry.ts**

Helper functions for the exponential backoff function. The exponential backoff function is needed because it can take a few seconds before the User document is created in the database. This happens because the User is created in an event based cloud function (see *auth.ts*). While this is more likely to happen on a cold start of the authCreate cloud function, it can happen any time.

# Disclaimer
Firebuilders has explicitly given me permission to share the code contained within this repository in a limited sample format.
