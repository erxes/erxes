const webCallReceived = `
  subscription cloudflareReceiveCall($roomState: String, $userId: String)
  {
    cloudflareReceiveCall(roomState: $roomState, userId: $userId){
      callerNumber
      roomState
      audioTrack
      conversationId
    }
  }`;

export default {
  webCallReceived,
};
