import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getWaitTime, delay } from "../utils/apiRetry";
const db = admin.firestore();
const logger = functions.logger;

const MAX_RETRIES = 8;

// Exponential backoff function that waits until the User doc has been created, up to x MAX_RETRIES
// See: https://cloud.google.com/iot/docs/how-tos/exponential-backoff
// See: https://dev.to/ycmjason/javascript-fetch-retry-upon-failure-3p6g
const updateUser = async (
  uid: string,
  programId: string,
  retryCount = 1
): Promise<any> => {
  try {
    return await db.doc(`users/${uid}`).update({
      programs: admin.firestore.FieldValue.arrayUnion(programId),
    });
  } catch (err) {
    // Retry on error
    if (err.code === 5) {
      logger.info("NOT FOUND Error. Retry attempt number " + retryCount);
      // Stop if at max retries
      if (retryCount >= MAX_RETRIES) {
        throw new Error(
          `EXCEEDED MAX RETRIES. ${err.message} after ${retryCount} attempts.`
        );
      }

      // Wait a bit
      const waitTime = getWaitTime(retryCount, 64);
      logger.info(`Waiting ${waitTime} seconds...`);
      await delay(waitTime * 1000);

      // Try again
      return await updateUser(uid, programId, retryCount + 1);
    } else {
      throw new Error(err.message);
    }
  }
};

export const cacheProgramSignUpCreate = functions.firestore
  .document("cache/programs/signUp/{id}")
  .onCreate(async (snap) => {
    const [uid, programId] = snap.id.split("_");

    // Check if program exists
    const program = await db.collection("programs").doc(programId).get();
    if (program.exists) {
      // Update User
      return updateUser(uid, programId)
        .then(() => {
          // Update cache doc with processing timestamp
          db.doc(`cache/programs/signUp/${snap.id}`).update({
            processed: true,
            processedAt: admin.firestore.Timestamp.now(),
          });
          logger.log("Processed", snap.id);
        })
        .catch((err) => {
          throw new Error(err.message);
        });
    } else {
      logger.info(`Program ID ${programId} does not exist.`);

      // Update cache doc with processing timestamp
      return db
        .doc(`cache/programs/signUp/${snap.id}`)
        .update({
          processed: true,
          processedAt: admin.firestore.Timestamp.now(),
          message: "Warning: program does not exist.",
        })
        .catch((err) => {
          throw new Error(err.message);
        });
    }
  });
