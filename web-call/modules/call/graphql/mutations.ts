import { gql } from "@apollo/client"

const call = gql`
  mutation cloudflareMakeCall(
    $callerNumber: String!
    $roomState: String!
    $audioTrack: String!
    $integrationId: String!
  ) {
    cloudflareMakeCall(
      callerNumber: $callerNumber
      roomState: $roomState
      audioTrack: $audioTrack
      integrationId: $integrationId
    )
  }
`
const leaveCall = gql`
  mutation CloudflareLeaveCall(
    $roomState: String!
    $originator: String
    $duration: Int
    $audioTrack: String!
  ) {
    cloudflareLeaveCall(
      roomState: $roomState
      originator: $originator
      duration: $duration
      audioTrack: $audioTrack
    ) {
      callerNumber
      roomState
      sessionId
      trackName
      audioTrack
    }
  }
`
export default {
  call,
  leaveCall,
}
