const webCallReceived = `
  subscription cloudflareReceiveCall($roomState: String, $userId: String, $audioTrack: String)
  {
    cloudflareReceiveCall(roomState: $roomState, userId: $userId, audioTrack: $audioTrack){
      callerNumber
      roomState
      audioTrack
      conversationId
    }
  }`;

export default {
  webCallReceived,
};
