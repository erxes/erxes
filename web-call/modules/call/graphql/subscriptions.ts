const webCallReceived = `
  subscription cloudflareReceivedCall($roomState: String)
  {
    cloudflareReceivedCall(roomState: $roomState){
      roomState
      audioTrack
    }
  }`

export default {
  webCallReceived,
}
