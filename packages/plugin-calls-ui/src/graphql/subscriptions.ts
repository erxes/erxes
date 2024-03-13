const phoneCallReceived = `
subscription phoneCallReceived ($subdomain: String!, $userId: String) {
  phoneCallReceived (subdomain: $subdomain, userId: $userId) 
  }`;

const sessionTerminateRequested = `
subscription sessionTerminateRequested ($subdomain: String!, $userId: String) {
  sessionTerminateRequested(subdomain: $subdomain, userId: $userId)
  }`;

export default {
  phoneCallReceived,
  sessionTerminateRequested,
};
