const CLOUDFLARE_CALL_RECEIVED = `
  subscription cloudflareReceivedCall($roomState: String)
  {
    cloudflareReceivedCall(roomState: $roomState){
      roomState
      audioTrack
    }
  }`

export {
  CLOUDFLARE_CALL_RECEIVED,
}
