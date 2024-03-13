const phoneCallReceived = `
subscription phoneCallReceived ($userId: String) {
  phoneCallReceived (userId: $userId) 
  }`;

const sessionTerminateRequested = `
subscription sessionTerminateRequested ($userId: String) {
  sessionTerminateRequested(userId: $userId)
  }`;

export default {
  phoneCallReceived,
  sessionTerminateRequested
};
