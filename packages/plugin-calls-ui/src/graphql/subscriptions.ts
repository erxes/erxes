const phoneCallReceived = `
subscription phoneCallReceived ($userId: String) {
  phoneCallReceived (userId: $userId) 
  }`;

export default {
  phoneCallReceived
};
