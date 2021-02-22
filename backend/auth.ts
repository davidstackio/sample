import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { parseName, parsePhone } from "./utils/authHelpers";
admin.initializeApp(); // Only do this once!
const db = admin.firestore();

export const authCreate = functions.auth.user().onCreate((user) => {
  const name = parseName(user.displayName);
  const phone = parsePhone(user.phoneNumber);

  return db
    .collection("users")
    .doc(user.uid)
    .set({
      firstName: name.first,
      lastName: name.last,
      email: user.email,
      phone: phone,
      photoURL: user.photoURL,
      created: admin.firestore.Timestamp.fromDate(
        new Date(user.metadata.creationTime)
      ),
      lastUpdated: admin.firestore.Timestamp.now(),
      timezone: null,
      disabled: user.disabled,
      notifications: {
        sms: {
          enabled: !!phone,
        },
      },
      programs: [],
    })
    .catch((err) => {
      throw new Error(err.message);
    });
});
