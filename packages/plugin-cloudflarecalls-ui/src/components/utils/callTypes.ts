export interface SessionDescription {
  type: "offer" | "answer"
  sdp: string
}

export interface ErrorResponse {
  errorCode?: string
  errorDescription?: string
}

export type NewSessionRequest = {
  sessionDescription: SessionDescription
}

export interface NewSessionResponse extends ErrorResponse {
  sessionDescription: SessionDescription
  sessionId: string
}

export type TrackObject = {
  location?: "local" | "remote"
  trackName?: string
  sessionId?: string
  mid?: string | null
}

export type TracksRequest = {
  tracks: TrackObject[]
  sessionDescription?: SessionDescription
}

export interface TracksResponse extends ErrorResponse {
  sessionDescription: SessionDescription
  requiresImmediateRenegotiation: boolean
  tracks?: (TrackObject & ErrorResponse)[]
}

export type RenegotiateRequest = {
  sessionDescription: SessionDescription
}

export interface RenegotiationResponse extends ErrorResponse {}

export type CloseTracksRequest = TracksRequest & {
  force: boolean
}

export interface EmptyResponse extends ErrorResponse {}

export type CallsRequest =
  | NewSessionRequest
  | TracksRequest
  | RenegotiateRequest
  | CloseTracksRequest
export type CallsResponse = EmptyResponse | TracksResponse
