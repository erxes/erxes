const CLOUDFLARE_CALL_RECEIVED = `
  subscription cloudflareReceivedCall($roomState: String, $audioTrack: String)
  {
    cloudflareReceivedCall(roomState: $roomState, audioTrack: $audioTrack){
      roomState
      audioTrack
    }
  }`;

export { CLOUDFLARE_CALL_RECEIVED };
