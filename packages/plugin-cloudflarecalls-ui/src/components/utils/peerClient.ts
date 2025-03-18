import invariant from 'tiny-invariant';

import 'webrtc-adapter';

import type {
  CallsRequest,
  CallsResponse,
  CloseTracksRequest,
  ErrorResponse,
  NewSessionResponse,
  RenegotiateRequest,
  RenegotiationResponse,
  SessionDescription,
  TrackObject,
  TracksRequest,
  TracksResponse,
} from './callTypes';
import Ewma from './ewma';
import { BulkRequestDispatcher, FIFOScheduler } from './peerUtils';

const iceGathertingTimeout = 1500; /* ms */
const newTrackTimeout = 10000;

const logCallsApiUsage = (message: string) => {
  console.debug(
    `%c 📞 Calls API: ${message}`,
    'color: orange; background: black;',
  );
};

export type PeerParams = {
  iceTrickleEnabled: boolean;
  callsAppId: string;
  callsAppSecret: string;
  baseURL: string;
  onDisconnect: (connectionState: RTCPeerConnectionState, event: Event) => void;
  onConnect: (connectionState: RTCPeerConnectionState, event: Event) => void;
  iceServers?: RTCIceServer[];
};

type PushTrackRequestEntry = {
  trackName: string;
  track: MediaStreamTrack;
  transceiver: RTCRtpTransceiver;
};

export type PeerHistory =
  | {
      type: 'request';
      endpoint: string;
      body: CallsRequest;
    }
  | {
      type: 'response';
      endpoint: string;
      body: CallsResponse;
    };

export type PeerDebugInfo = ReturnType<Peer['getDebugInfo']>;

const PullTrackBatchSizeLimit = 32;

export default class Peer {
  pc: RTCPeerConnection;
  transceivers: RTCRtpTransceiver[];
  params: PeerParams;
  pendingTrackTransceivers: Record<string, (track: MediaStreamTrack) => void>;
  trackToMid: Record<string, string>;

  pushTrackDispatcher: BulkRequestDispatcher<
    PushTrackRequestEntry,
    TracksResponse
  >;
  pullTrackDispatcher: BulkRequestDispatcher<
    TrackObject,
    {
      bulkResponse: TracksResponse & ErrorResponse;
      trackPromises: (Promise<MediaStreamTrack> | undefined)[];
    }
  >;
  closeTrackDispatcher: BulkRequestDispatcher<string, TracksResponse>;

  initialization: Promise<void>;
  taskScheduler: FIFOScheduler;
  sessionId: string | undefined;

  constructor(params: Partial<PeerParams> = {}) {
    this.pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.cloudflare.com:3478',
        },
      ],
      bundlePolicy: 'max-bundle',
    });

    this.transceivers = [];
    this.params = this.defaultParams(params);

    this.pendingTrackTransceivers = {};
    this.trackToMid = {};
    this.initialization = this.init();
    this.taskScheduler = new FIFOScheduler();
    this.pushTrackDispatcher = new BulkRequestDispatcher();
    this.pullTrackDispatcher = new BulkRequestDispatcher(
      PullTrackBatchSizeLimit,
    );
    this.closeTrackDispatcher = new BulkRequestDispatcher();
    setInterval(() => this.checkStats(900), 1000);
  }

  defaultParams(params: Partial<PeerParams>) {
    return {
      iceTrickleEnabled: false,
      baseURL: '/api/calls',
      onDisconnect: () => {},
      onConnect: () => {},
      ...params,
    };
  }

  static async sendRequest(
    method: string,
    request: CallsRequest,
    endpoint: string,
    configs: { callsAppId: string; callsAppSecret: string },
    extraParams = '',
    remainingAttempts = 2,
  ): Promise<CallsResponse> {
    const url = new URL(endpoint, window.location.origin);
    const extraParamEntries = Array.from(
      new URLSearchParams(extraParams).entries(),
    );

    extraParamEntries.forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const httpRequest: RequestInit = {
      method: method,
      mode: 'cors',
      redirect: 'manual',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${configs.callsAppSecret}`,
      },
      body: JSON.stringify(request),
    } as const;
    logCallsApiUsage('Sending Calls request:');
    console.debug(httpRequest.method, endpoint);
    console.debug(httpRequest);

    try {
      const response = await fetch(url, httpRequest);

      // handle Access redirect
      if (response.status === 0) {
        alert('Access session is expired, reloading page.');
        location.reload();
      }
      const callsResponse = await response.json();
      return callsResponse;
    } catch (error) {
      if (remainingAttempts === 0) {
        throw error;
      } else {
        console.error('Calls request failed, retrying...');
        return Peer.sendRequest(
          method,
          request,
          endpoint,
          configs,
          extraParams,
          remainingAttempts - 1,
        );
      }
    }
  }

  async init() {
    // In order to establish a connection we should provide at least one
    // transceiver with candidate ports. This dummy "inactive" audio track
    // works for that purpose

    const baseUrl = `https://rtc.live.cloudflare.com/v1/apps/${this.params.callsAppId}`;

    this.transceivers.push(
      this.pc.addTransceiver('audio', { direction: 'inactive' }),
    );

    // Set up connection state change logging
    this.pc.onconnectionstatechange = () => {};

    this.pc.setLocalDescription(await this.pc.createOffer());
    this.pc.addEventListener('iceconnectionstatechange', this.handleIceFailure);

    this.pc.ontrack = (event) => {
      if (event.transceiver.mid === null) return;
      let resolve = this.pendingTrackTransceivers[event.transceiver.mid];
      if (resolve) {
        delete this.pendingTrackTransceivers[event.transceiver.mid];
        resolve(event.track);
      } else {
        console.warn('No pending track for transceiver', event.transceiver);
      }
    };

    let connectedState = new Promise((resolve, _) => {
      this.pc.addEventListener('connectionstatechange', () => {
        if (this.pc.connectionState == 'connected') {
          resolve(true);
        }
      });
    });

    let gatheringReady = new Promise((resolve, _) => {
      // get all the candidates it can until to reach iceGathertingTimeout
      setTimeout(() => resolve(true), iceGathertingTimeout);
      if (this.params.iceTrickleEnabled) {
        // if ice trickle enabled, gathering is ready when it gets the first candidate
        this.pc.addEventListener('icecandidate', (_e) => {
          resolve(true);
          // send ICE trickle update here
        });
      }
      this.pc.onicegatheringstatechange = (_ev) => {
        if (this.pc.iceGatheringState === 'complete') {
          resolve(true);
        }
      };
    });

    this.pc.addEventListener('connectionstatechange', (event) => {
      switch (this.pc.connectionState) {
        case 'connected':
          this.params.onConnect(this.pc.connectionState, event);
          break;
        case 'failed':
        case 'disconnected':
          this.params.onDisconnect(this.pc.connectionState, event);
      }
    });

    await gatheringReady;
    invariant(this.pc.localDescription);
    logCallsApiUsage('Sending initial offer');

    const response = (await Peer.sendRequest(
      'POST',
      {
        sessionDescription: {
          type: 'offer',
          sdp: this.pc.localDescription.sdp,
        } as SessionDescription,
      },
      `${baseUrl}/sessions/new`,
      {
        callsAppId: this.params.callsAppId || '',
        callsAppSecret: this.params.callsAppSecret || '',
      },
      // this.params.apiExtraParams
    )) as NewSessionResponse;
    if (response.errorCode) {
      throw new Error(response.errorDescription);
    }
    this.sessionId = response.sessionId;
    await this.pc.setRemoteDescription(
      new RTCSessionDescription(response.sessionDescription),
    );
    await connectedState;
  }

  getTransceiverFor(
    track: MediaStreamTrack,
    sendEncodings?: RTCRtpEncodingParameters[],
  ) {
    const transceiver = this.pc.addTransceiver(track, {
      direction: 'sendonly',
      sendEncodings,
    });
    this.transceivers.push(transceiver);
    return transceiver;
  }

  async replaceTrack(resourceID: string, track: MediaStreamTrack) {
    console.debug(`Peer.replaceTrack: ${resourceID} ${track.id}`);
    const id = resourceID.split('/')[1];
    // need to find the sender based on the MID?
    const mid = this.trackToMid[id];
    invariant(mid, `mid for ${id} not found`);
    const sender = this.pc.getTransceivers().find((t) => t.mid === mid)?.sender;
    invariant(sender, `sender for ${resourceID} not found`);
    this.trackToMid[track.id] = mid;
    sender.replaceTrack(track);
    return resourceID.replace(id, track.id);
  }

  async configureSender(
    resourceID: string,
    track: MediaStreamTrack,
    newParams: {
      encodings?: RTCRtpEncodingParameters[];
    },
  ) {
    console.debug(`Peer.configureSender: ${resourceID} ${track.id}`);
    const id = resourceID.split('/')[1];
    // need to find the sender based on the MID?
    const mid = this.trackToMid[id];
    invariant(mid, `mid for ${id} not found`);
    const sender = this.pc.getTransceivers().find((t) => t.mid === mid)?.sender;
    invariant(sender, `sender for ${resourceID} not found`);
    this.trackToMid[track.id] = mid;
    const parameters = sender.getParameters();
    newParams.encodings?.forEach((encoding, i) => {
      const existing = parameters.encodings[i];
      parameters.encodings[i] = { ...existing, ...encoding };
    });
    sender.setParameters(parameters);
  }

  async pushTrack(
    trackName: string,
    track: MediaStreamTrack,
    sendEncodings?: RTCRtpEncodingParameters[],
  ): Promise<TrackObject> {
    const baseUrl = `https://rtc.live.cloudflare.com/v1/apps/${this.params.callsAppId}`;

    console.debug(`Peer.pushTrack: ${track.kind} ${trackName}`);
    await this.initialization;
    const bulkResponse = (await this.pushTrackDispatcher.doBulkRequest(
      {
        trackName: trackName,
        track: track,
        transceiver: this.getTransceiverFor(track, sendEncodings),
      },
      async (batchCopy: PushTrackRequestEntry[]) => {
        return await this.taskScheduler.schedule(async () => {
          // Local offer must be created one time at most for the tracks
          await this.pc.setLocalDescription(await this.pc.createOffer());
          invariant(this.pc.localDescription);
          const request: TracksRequest = {
            tracks: batchCopy.map((trackEntry) => {
              return {
                location: 'local',
                mid: trackEntry.transceiver.mid,
                trackName: trackEntry.trackName,
              };
            }),
            sessionDescription: {
              sdp: this.pc.localDescription.sdp,
              type: 'offer',
            },
          };

          const response = (await Peer.sendRequest(
            'POST',
            request,
            `${baseUrl}/sessions/${this.sessionId}/tracks/new`,
            {
              callsAppId: this.params.callsAppId,
              callsAppSecret: this.params.callsAppSecret,
            },
          )) as TracksResponse;
          if (!response.errorCode) {
            // If everything went fine, we set the remote answer (once)
            await this.pc.setRemoteDescription(
              new RTCSessionDescription(response.sessionDescription),
            );
          }
          return response;
        });
      },
    )) as TracksResponse;
    if (bulkResponse.errorCode) {
      throw new Error(bulkResponse.errorDescription);
    }
    const trackResponse = bulkResponse.tracks?.find(
      (track) => track.trackName == trackName,
    );
    if (!trackResponse) {
      throw new Error(`No response for trackName=${trackName}`);
    }
    if (trackResponse?.errorCode) {
      throw new Error(
        `${trackResponse.errorCode}: ${trackResponse.errorDescription}`,
      );
    }
    invariant(trackResponse.mid);
    this.trackToMid[track.id] = trackResponse.mid;
    return {
      location: 'remote',
      sessionId: this.sessionId,
      trackName: trackName,
    };
  }

  resolveTrack(mid: string) {
    return new Promise<MediaStreamTrack>((resolve, reject) => {
      setTimeout(reject, newTrackTimeout, 'track resolving timed out');
      this.pendingTrackTransceivers[mid] = (track: MediaStreamTrack) =>
        resolve(track);
    });
  }

  async renegotiate() {
    // stage 1
    invariant(this.pc.currentLocalDescription);
    const baseUrl = `https://rtc.live.cloudflare.com/v1/apps/${this.params.callsAppId}`;

    const request: RenegotiateRequest = {
      sessionDescription: {
        sdp: this.pc.currentLocalDescription.sdp,
        type: 'answer',
      },
    };
    const response = (await Peer.sendRequest(
      'PUT',
      request,
      `${baseUrl}/sessions/${this.sessionId}/renegotiate`,
      {
        callsAppId: this.params.callsAppId,
        callsAppSecret: this.params.callsAppSecret,
      },

      // this.params.apiExtraParams
    )) as RenegotiationResponse;
    if (response.errorCode) {
      throw new Error(response.errorDescription);
    }
  }

  async pullTrack(trackObject: TrackObject): Promise<MediaStreamTrack> {
    console.debug(
      `Peer.pullTrack: ${trackObject.trackName} from peer ${trackObject.sessionId}`,
    );
    const baseUrl = `https://rtc.live.cloudflare.com/v1/apps/${this.params.callsAppId}`;

    await this.initialization;
    const { bulkResponse, trackPromises } =
      await this.pullTrackDispatcher.doBulkRequest(
        trackObject,
        async (batchCopy: TrackObject[]) => {
          return await this.taskScheduler.schedule(async () => {
            const request: TracksRequest = {
              tracks: batchCopy,
            };
            const response = (await Peer.sendRequest(
              'POST',
              request,
              `${baseUrl}/sessions/${this.sessionId}/tracks/new`,
              {
                callsAppId: this.params.callsAppId,
                callsAppSecret: this.params.callsAppSecret,
              },
            )) as TracksResponse;
            if (response.errorCode) {
              throw new Error(response.errorDescription);
            }
            invariant(response.tracks);
            // resolving a mid as MediaStreamTrack must be done before setting
            // the remote offer to be able to catch it in time
            let trackPromises = response.tracks.map((track) => {
              if (track.mid) {
                return this.resolveTrack(track.mid);
              } else return undefined;
            }); // todo: should this be filtered to remove undefined?
            if (response.requiresImmediateRenegotiation) {
              await this.pc.setRemoteDescription(
                new RTCSessionDescription(response.sessionDescription),
              );
              const answerSDP = await this.pc.createAnswer();
              await this.pc.setLocalDescription(answerSDP);
              await this.renegotiate();
            }
            return { bulkResponse: response, trackPromises: trackPromises };
          });
        },
      );
    const trackResponseIdx = bulkResponse.tracks?.findIndex(
      (track) =>
        track.sessionId == trackObject.sessionId &&
        track.trackName == trackObject.trackName,
    );
    if (
      !bulkResponse.tracks ||
      trackResponseIdx === undefined ||
      trackResponseIdx == -1
    ) {
      throw new Error(
        `No response for sessionId=${trackObject.sessionId}, trackName=${trackObject.trackName}`,
      );
    }
    const trackResponse = bulkResponse.tracks[trackResponseIdx];
    if (trackResponse?.errorCode) {
      throw new Error(
        `${trackResponse.errorCode}: ${trackResponse.errorDescription}`,
      );
    }
    const trackPromise = trackPromises[trackResponseIdx];
    invariant(trackPromise);
    invariant(trackResponse.mid);
    const track = await trackPromise;

    this.trackToMid[track.id] = trackResponse.mid;
    return track;
  }

  async closeTrack(track: MediaStreamTrack) {
    console.debug(`Peer.closeTrack: ${track.id}`);
    const baseUrl = `https://rtc.live.cloudflare.com/v1/apps/${this.params.callsAppId}`;

    const mid = this.trackToMid[track.id];
    if (!mid) {
      throw new Error('stream has no associated transceiver');
    }
    await this.initialization;
    const bulkResponse = await this.closeTrackDispatcher.doBulkRequest(
      mid,
      async (batchCopy: string[]) => {
        return await this.taskScheduler.schedule(async () => {
          // Either the transceiver is sendonly or recvonly, we close it from this side
          // to trigger the appropriate response from Thunderclap
          let transceivers = this.pc.getTransceivers().filter((t) => {
            invariant(t.mid);
            return batchCopy.includes(t.mid);
          });
          transceivers.forEach((t) => (t.direction = 'inactive'));

          await this.pc.setLocalDescription(await this.pc.createOffer());
          invariant(this.pc.localDescription);
          const request: CloseTracksRequest = {
            tracks: batchCopy.map((mid) => {
              return { mid: mid };
            }),
            sessionDescription: {
              sdp: this.pc.localDescription.sdp,
              type: 'offer',
            },
            force: false,
          };
          const response = (await Peer.sendRequest(
            'PUT',
            request,
            `${baseUrl}/sessions/${this.sessionId}/tracks/close`,
            {
              callsAppId: this.params.callsAppId,
              callsAppSecret: this.params.callsAppSecret,
            },
          )) as TracksResponse;

          if (response.errorCode) {
            throw new Error(response.errorDescription);
          }

          await this.pc.setRemoteDescription(
            new RTCSessionDescription(response.sessionDescription),
          );
          return response;
        });
      },
    );
    const trackResponse = bulkResponse.tracks?.find(
      (track) => track.mid === mid,
    );
    if (!trackResponse) {
      throw new Error(`No response for mid=${mid}`);
    }
    if (trackResponse?.errorCode) {
      throw new Error(
        `${trackResponse.errorCode}: ${trackResponse.errorDescription}`,
      );
    }
    delete this.trackToMid[track.id];
    this.transceivers = this.transceivers.filter(
      (transceiver) => transceiver.mid != mid,
    );
  }

  outboundPacketLossPercentageEwma = new Ewma(1000, 0);
  inboundPacketLossPercentageEwma = new Ewma(1000, 0);
  availableOutboundBitrate = new Ewma(1000, 0);

  checkStats = async (timeout: number) => {
    const baseline = await this.pc.getStats();
    await new Promise((res) => setTimeout(res, timeout));
    const now = await this.pc.getStats();

    now.forEach((nowReport: Stats) => {
      if (
        nowReport.type === 'candidate-pair' &&
        'availableOutgoingBitrate' in nowReport
      ) {
        this.availableOutboundBitrate.insert(
          Number(nowReport.availableOutgoingBitrate),
        );
      }

      if (
        nowReport.type !== 'remote-inbound-rtp' &&
        nowReport.type !== 'inbound-rtp'
      )
        return;
      const baseReport = baseline.get(nowReport.id) as Stats;
      if (!baseReport) return;

      // For outbound-rtp, packetsLost might not be present. Consider it as 0 in such cases.
      const packetsLost = Math.max(
        (nowReport.packetsLost || 0) - (baseReport.packetsLost || 0),
        0,
      );

      if (
        nowReport.type === 'remote-inbound-rtp' &&
        nowReport.fractionLost !== undefined
      ) {
        this.outboundPacketLossPercentageEwma.insert(nowReport.fractionLost);
        return;
      }

      const packetsReceived =
        nowReport.packetsReceived - baseReport.packetsReceived;

      if (packetsReceived > 0) {
        const packetLossPercentage = packetsLost / packetsReceived;
        this.inboundPacketLossPercentageEwma.insert(packetLossPercentage);
      }
    });
  };

  getDebugInfo() {
    return {
      trackToMid: this.trackToMid,
      inboundPacketLossPercentage: this.inboundPacketLossPercentageEwma.value(),
      outboundPacketLossPercentage:
        this.outboundPacketLossPercentageEwma.value(),
      availableOutboundBitrate: this.availableOutboundBitrate.value(),
    };
  }

  handleIceFailure = async () => {
    const { iceConnectionState } = this.pc;
    if (iceConnectionState === 'closed' || iceConnectionState === 'failed') {
      alert(
        `Oh no! It appears that your connection closed unexpectedly. We've copied your session id to your clipboard, and will now reload the page to reconnect!`,
      );
      if (this.sessionId) {
        await navigator.clipboard.writeText(this.sessionId);
      }
      window.location.reload();
    }
  };

  destroy() {
    this.pc.removeEventListener(
      'iceconnectionstatechange',
      this.handleIceFailure,
    );
    this.pc.close();
  }
}

interface Stats {
  id: string;
  timestamp: number;
  type: string;
  codecId: string;
  kind: string;
  mediaType: string;
  ssrc: number;
  transportId: string;
  jitter: number;
  packetsLost: number;
  packetsReceived: number;
  audioLevel: number;
  bytesReceived: number;
  concealedSamples: number;
  concealmentEvents: number;
  fecPacketsDiscarded: number;
  fecPacketsReceived: number;
  fractionLost?: number;
  headerBytesReceived: number;
  insertedSamplesForDeceleration: number;
  jitterBufferDelay: number;
  jitterBufferEmittedCount: number;
  jitterBufferMinimumDelay: number;
  jitterBufferTargetDelay: number;
  lastPacketReceivedTimestamp: number;
  mid: string;
  packetsDiscarded: number;
  packetsSent: number;
  playoutId: string;
  remoteId: string;
  removedSamplesForAcceleration: number;
  silentConcealedSamples: number;
  totalAudioEnergy: number;
  totalSamplesDuration: number;
  totalSamplesReceived: number;
  trackIdentifier: string;
}
