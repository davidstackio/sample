import firebase from "../firebase";

// Configure FirebaseUI
export const uiConfig = {
  signInFlow: "popup",
  signInSuccessUrl: "/",
  // Auth providers to display
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
    },
  ],
  // Terms of service url
  tosUrl: "/policies/terms",
  // Privacy policy url
  privacyPolicyUrl: "/policies/privacy",
};

export default uiConfig;
