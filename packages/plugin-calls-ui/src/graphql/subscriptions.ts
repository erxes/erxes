const phoneCallReceived = `
subscription phoneCallReceived ($userId: String) {
  phoneCallReceived (userId: $userId) 
  }`;

const sessionTerminateRequested = `
subscription sessionTerminateRequested ($userId: String) {
  sessionTerminateRequested(userId: $userId)
  }`;
const waitingCallReceived = `
subscription waitingCallReceived($extension: String) {
  waitingCallReceived(extension: $extension)
  }`;

const talkingCallReceived = `
subscription talkingCallReceived($extension: String) {
  talkingCallReceived(extension: $extension)
  }`;

const agentCallReceived = `
subscription agentCallReceived($extension: String) {
  agentCallReceived(extension: $extension)
  }`;

export default {
  phoneCallReceived,
  sessionTerminateRequested,
  talkingCallReceived,
  waitingCallReceived,
  agentCallReceived,
};
