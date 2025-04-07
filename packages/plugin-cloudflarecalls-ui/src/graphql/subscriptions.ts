const webCallReceive = `
  subscription cloudflareReceiveCall($roomState: String, $userId: String, $audioTrack: String)
  {
    cloudflareReceiveCall(roomState: $roomState, userId: $userId, audioTrack: $audioTrack){
      callerNumber
      roomState
      audioTrack
      conversationId
      customerAudioTrack
    }
  }`;

export default {
  webCallReceive,
};
