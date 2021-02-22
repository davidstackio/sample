import * as admin from "firebase-admin";

interface Auth {
  uid: string;
  token: admin.auth.DecodedIdToken;
}

export function parseName(
  displayName: string | undefined
): { first: string; last: string } {
  let first = "";
  let last = "";
  if (displayName) {
    const nameSplit = displayName.split(" ");
    first = nameSplit[0];

    if (nameSplit.length > 1) {
      last = nameSplit.slice(1).join(" ");
    }
  }

  return { first, last };
}

export function parsePhone(phone: string | undefined): string | undefined {
  if (!phone) {
    return phone;
  }

  // Remove all non numeric characters (except plus sign)
  const phoneClean = phone.replace(/[^\d+]/g, "");
  return phoneClean;
}

// A user's email is on the @firebuilders.io domain
// with the Google sign in method
export function firebuildersUser(auth: Auth | undefined): boolean | undefined {
  return (
    auth &&
    !!auth.token.email?.match(".*@firebuilders[.]io") &&
    auth.token.firebase.sign_in_provider === "google.com"
  );
}
