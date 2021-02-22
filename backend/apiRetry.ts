// Exponential backoff helper functions

const getRandomArbitrary = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const getWaitTime = (retryCount: number, maxBackoff: number) => {
  // See: https://cloud.google.com/iot/docs/how-tos/exponential-backoff
  // Returns seconds as a decimal, NOT milliseconds
  const randomWait = getRandomArbitrary(0, 1000) / 1000;
  return Math.min(2 ** (retryCount - 1) + randomWait, maxBackoff);
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
