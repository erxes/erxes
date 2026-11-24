import React, {
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import * as JsSIP from 'jssip';
import type { IceCandidateEvent, RTCSession } from 'jssip/lib/RTCSession';
import type { CallOptions, RTCSessionEvent } from 'jssip/lib/UA';
import { useApolloClient } from '@apollo/client';
import {
  SipErrorTypeEnum,
  SipStatusEnum,
  CallDirectionEnum,
  CallStatusEnum,
  ExtraHeaders,
  SipProviderProps,
  SipContextValue,
  ReconnectSipOptions,
} from '../types/sipTypes';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  callInfoAtom,
  rtcSessionAtom,
  sipStateAtom,
} from '../states/sipStates';
import { getPluginAssetsUrl, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  extractPhoneNumberFromCounterpart,
  isCallCompletedElsewhere,
  logger,
} from '@/integrations/call/utils/callUtils';
import { callNumberState } from '@/integrations/call/states/callWidgetStates';
import { callDurationAtom } from '@/integrations/call/states/callStates';
import { callWidgetOpenAtom } from '@/integrations/call/states/callWidgetOpenAtom';
import { refetchCallHistories } from '@/integrations/call/hooks/useCallHistories';

const ICE_GATHERING_SETTLE_MS = 1000;
const ICE_GATHERING_MAX_MS = 1500;
const ICE_RELAY_GRACE_MS = 250;
const DEFAULT_EXTRA_HEADERS: ExtraHeaders = { register: [], invite: [] };
const NO_ICE_SERVERS: RTCIceServer[] = [];

type DesktopPhoneState = {
  language: string;
  status: 'connecting' | 'ready' | 'offline';
  call: {
    number: string;
    name: string | null;
    direction: 'incoming' | 'outgoing';
    talking: boolean;
    since: number | null;
    muted: boolean;
    held: boolean;
  } | null;
  queues: never[];
};

type DesktopPhoneCommand =
  | { type: 'openPhone' | 'answer' | 'hangUp' | 'mute' | 'hold' }
  | { type: 'dial'; number: string };

declare global {
  interface Window {
    /** The erxes desktop app's preload; absent in a browser. */
    erxesDesktop?: {
      phone: (state: DesktopPhoneState | null) => void;
      onCommand: (
        listener: (command: DesktopPhoneCommand) => void,
      ) => () => void;
    };
  }
}

const SipContext = createContext<SipContextValue | null>(null);

export const SipProvider = ({
  host = null,
  port = null,
  pathname = '',
  user = null,
  password,
  autoRegister = false,
  autoAnswer = false,
  sessionTimersExpires = 3600,
  extraHeaders = DEFAULT_EXTRA_HEADERS,
  iceServers = NO_ICE_SERVERS,
  debug = false,
  children,
}: SipProviderProps & { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const client = useApolloClient();
  const callInfo = useAtomValue(callInfoAtom);
  const setCallNumber = useSetAtom(callNumberState);
  const setWidgetOpen = useSetAtom(callWidgetOpenAtom);
  const [sipState, setSipState] = useAtom(sipStateAtom);
  const [rtcSessionState, setRtcSessionState] = useAtom(rtcSessionAtom);
  const [callStartedAt, setCallStartedAt] = useAtom(callDurationAtom);
  const [answeringSession, setAnsweringSession] = useState<RTCSession | null>(
    null,
  );
  const [media, setMedia] = useState({ muted: false, held: false });

  const uaRef = useRef<JsSIP.UA | null>(null);
  const rtcSessionRef = useRef<RTCSession | null>(null);
  const answeringSessionRef = useRef<RTCSession | null>(null);
  const ringbackToneRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const iceServersRef = useRef(iceServers);
  const callInfoRef = useRef(callInfo);

  iceServersRef.current = iceServers;
  callInfoRef.current = callInfo;

  const playHangupTone = useCallback(() => {
    if (!ringbackToneRef.current) {
      ringbackToneRef.current = new Audio(
        getPluginAssetsUrl('frontline', '/sound/hangup.mp3'),
      );
      ringbackToneRef.current.loop = false;
      ringbackToneRef.current
        .play()
        .catch(() => {
          ringbackToneRef.current = null;
        })
        .then(() => {
          ringbackToneRef.current = null;
        });
    }
  }, []);

  const stopRingbackTone = useCallback(() => {
    if (ringbackToneRef.current) {
      ringbackToneRef.current.pause();
      ringbackToneRef.current.currentTime = 0;
      ringbackToneRef.current = null;
    }
  }, []);

  const setAnswering = useCallback((session: RTCSession | null) => {
    answeringSessionRef.current = session;
    setAnsweringSession(session);
  }, []);

  const setSession = useCallback(
    (session: RTCSession | null) => {
      rtcSessionRef.current = session;
      setRtcSessionState(session);
    },
    [setRtcSessionState],
  );

  // Ends only the given session; a late event from another call is ignored.
  const clearSession = useCallback(
    (rtcSession: RTCSession) => {
      if (rtcSessionRef.current !== rtcSession) return;
      setSession(null);
      if (answeringSessionRef.current === rtcSession) setAnswering(null);
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
      setMedia({ muted: false, held: false });
      setCallStartedAt(null);
      setSipState((prev) => ({
        ...prev,
        callStatus: CallStatusEnum.IDLE,
        callDirection: null,
        callCounterpart: null,
        groupName: '',
      }));
      refetchCallHistories(client);
    },
    [client, setAnswering, setCallStartedAt, setSession, setSipState],
  );

  // SIP control functions
  const registerSip = useCallback(() => {
    if (autoRegister) {
      throw new Error(
        'Calling registerSip is not allowed when autoRegister === true',
      );
    }
    if (sipState.sipStatus !== SipStatusEnum.CONNECTED) {
      throw new Error(
        `Calling registerSip is not allowed when sip status is ${sipState.sipStatus} (expected ${SipStatusEnum.CONNECTED})`,
      );
    }
    return uaRef.current?.register();
  }, [autoRegister, sipState.sipStatus]);

  const unregisterSip = useCallback(() => {
    if (autoRegister) {
      throw new Error(
        'Calling unregisterSip is not allowed when autoRegister === true',
      );
    }
    if (sipState.sipStatus !== SipStatusEnum.REGISTERED) {
      throw new Error(
        `Calling unregisterSip is not allowed when sip status is ${sipState.sipStatus} (expected ${SipStatusEnum.REGISTERED})`,
      );
    }
    return uaRef.current?.unregister();
  }, [autoRegister, sipState.sipStatus]);

  // Call control functions
  const answerCall = useCallback(() => {
    const session = rtcSessionRef.current;
    if (
      !session ||
      answeringSessionRef.current === session ||
      session.direction !== 'incoming' ||
      !session.isInProgress()
    ) {
      return;
    }
    setAnswering(session);
    try {
      session.answer({
        mediaConstraints: { audio: true, video: false },
        pcConfig: { iceServers: iceServersRef.current },
      });
    } catch (error) {
      logger.error(error);
      // A half-answered session would keep rejecting new calls with 486.
      try {
        session.terminate({ status_code: 480 });
      } catch {
        clearSession(session);
      }
      if (answeringSessionRef.current === session) setAnswering(null);
    }
  }, [clearSession, setAnswering]);

  const startCall = useCallback(
    (destination: string) => {
      if (!destination) {
        throw new Error(`Destination must be defined (${destination} given)`);
      }
      if (
        sipState.sipStatus !== SipStatusEnum.CONNECTED &&
        sipState.sipStatus !== SipStatusEnum.REGISTERED
      ) {
        throw new Error(
          `Calling startCall() is not allowed when sip status is ${sipState.sipStatus}, expected ${SipStatusEnum.CONNECTED} or ${SipStatusEnum.REGISTERED}`,
        );
      }
      if (sipState.callStatus !== CallStatusEnum.IDLE) {
        throw new Error(
          `Calling startCall() is not allowed when call status is ${sipState.callStatus}, expected ${CallStatusEnum.IDLE}`,
        );
      }

      const options: CallOptions = {
        extraHeaders: extraHeaders.invite,
        mediaConstraints: { audio: true, video: false },
        pcConfig: {
          iceServers,
          bundlePolicy: 'balanced',
          rtcpMuxPolicy: 'require',
        },
        sessionTimersExpires,
      };

      uaRef.current?.call(destination, options);
      setSipState((prev) => ({
        ...prev,
        callStatus: CallStatusEnum.STARTING,
      }));
    },
    [
      sipState.sipStatus,
      sipState.callStatus,
      extraHeaders.invite,
      iceServers,
      sessionTimersExpires,
      setSipState,
    ],
  );

  const stopCall = useCallback(() => {
    const session = rtcSessionRef.current;
    if (!session) {
      setSipState((prev) => ({ ...prev, callStatus: CallStatusEnum.IDLE }));
      return;
    }
    try {
      session.terminate();
    } catch (error) {
      logger.error(error);
      clearSession(session);
    }
  }, [clearSession, setSipState]);

  // Audio control functions
  const mute = useCallback(() => {
    rtcSessionState?.mute();
  }, [rtcSessionState]);

  const unmute = useCallback(() => {
    rtcSessionState?.unmute();
  }, [rtcSessionState]);

  const hold = useCallback(() => {
    rtcSessionState?.hold();
  }, [rtcSessionState]);

  const unhold = useCallback(() => {
    rtcSessionState?.unhold();
  }, [rtcSessionState]);

  const sendDtmf = useCallback(
    (tones: string) => {
      rtcSessionState?.sendDTMF(tones);
    },
    [rtcSessionState],
  );

  // Plays the remote party as soon as its track arrives, for either direction.
  const attachRemoteAudio = useCallback(
    (rtcSession: RTCSession, peerConnection: RTCPeerConnection) => {
      peerConnection.addEventListener('track', (event) => {
        const audio = remoteAudioRef.current;
        if (!audio || rtcSessionRef.current !== rtcSession) return;
        audio.autoplay = true;
        audio.srcObject = event.streams[0] ?? new MediaStream([event.track]);
        audio.play().catch((error) => {
          logger.debug('Error playing remote audio', error);
        });
      });
    },
    [],
  );

  // Sends the SDP early: 250ms after the first relay candidate, else one
  // second after the last candidate, and never later than 1.5s after the
  // first. Returns the cleanup for the session's end.
  const watchIceGathering = useCallback((rtcSession: RTCSession) => {
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let capTimer: ReturnType<typeof setTimeout> | undefined;
    let pendingReady: VoidFunction | null = null;
    let relayArrived = false;

    const clear = () => {
      clearTimeout(settleTimer);
      clearTimeout(capTimer);
      pendingReady = null;
      relayArrived = false;
    };
    const finish = () => {
      const ready = pendingReady;
      clear();
      ready?.();
    };

    rtcSession.on('icecandidate', ({ candidate, ready }: IceCandidateEvent) => {
      if (pendingReady !== ready) {
        clear();
        pendingReady = ready;
        capTimer = setTimeout(finish, ICE_GATHERING_MAX_MS);
      }
      // Once a relay is in hand, the grace timer runs out undisturbed.
      if (relayArrived) return;
      clearTimeout(settleTimer);
      if (candidate.type === 'relay') {
        relayArrived = true;
        settleTimer = setTimeout(finish, ICE_RELAY_GRACE_MS);
        return;
      }
      settleTimer = setTimeout(finish, ICE_GATHERING_SETTLE_MS);
    });

    return clear;
  }, []);

  const handleNewSession = useCallback(
    ({ originator, session: rtcSession, request }: RTCSessionEvent) => {
      const isIncoming = originator === 'remote';

      if (rtcSessionRef.current) {
        logger.debug('second call replied with 486 "Busy Here"');
        rtcSession.terminate(
          isIncoming ? { status_code: 486, reason_phrase: 'Busy Here' } : {},
        );
        return;
      }

      const uri = (isIncoming ? request.from : request.to).toString();
      const counterpart = uri.split(';')[0];
      const callDirection = isIncoming
        ? CallDirectionEnum.INCOMING
        : CallDirectionEnum.OUTGOING;

      setSession(rtcSession);
      setSipState((prev) => ({
        ...prev,
        callDirection,
        callStatus: CallStatusEnum.STARTING,
        callCounterpart: counterpart,
        groupName: isIncoming
          ? request.from.getParam<string>('x-gs-group-name') || ''
          : '',
      }));

      const boundConnections = new WeakSet<RTCPeerConnection>();
      const bindConnection = (peerConnection: RTCPeerConnection) => {
        if (boundConnections.has(peerConnection)) return;
        boundConnections.add(peerConnection);
        attachRemoteAudio(rtcSession, peerConnection);
      };
      if (rtcSession.connection) bindConnection(rtcSession.connection);
      rtcSession.on('peerconnection', ({ peerconnection }) =>
        bindConnection(peerconnection),
      );

      const stopIceGathering = watchIceGathering(rtcSession);

      const syncMedia = () => {
        if (rtcSessionRef.current !== rtcSession) return;
        setMedia({
          muted: !!rtcSession.isMuted().audio,
          held: rtcSession.isOnHold().local,
        });
      };
      rtcSession.on('muted', syncMedia);
      rtcSession.on('unmuted', syncMedia);
      rtcSession.on('hold', syncMedia);
      rtcSession.on('unhold', syncMedia);

      rtcSession.on('failed', (e) => {
        stopRingbackTone();
        stopIceGathering();
        if (rtcSessionRef.current !== rtcSession) return;

        if (e.cause === JsSIP.C.causes.USER_DENIED_MEDIA_ACCESS) {
          toast({
            title: t('mic-permission-denied'),
            variant: 'destructive',
          });
        } else if (
          isIncoming &&
          e.originator !== 'local' &&
          !isCallCompletedElsewhere(e.message)
        ) {
          toast({
            title: t('missed-call'),
            description: extractPhoneNumberFromCounterpart(counterpart),
            variant: 'destructive',
          });
        }
        clearSession(rtcSession);
      });

      rtcSession.on('ended', (e) => {
        stopRingbackTone();
        stopIceGathering();
        if (rtcSessionRef.current !== rtcSession) return;
        if (e.cause === JsSIP.C.causes.BYE) {
          playHangupTone();
          setCallNumber('');
        }
        clearSession(rtcSession);
      });

      rtcSession.on('accepted', () => {
        stopRingbackTone();
        if (rtcSessionRef.current !== rtcSession) return;
        setCallStartedAt(new Date());
        setSipState((prev) => ({
          ...prev,
          callStatus: CallStatusEnum.ACTIVE,
        }));
        remoteAudioRef.current?.play().catch((error) => {
          logger.debug('Error playing remote audio', error);
        });
      });

      if (isIncoming && autoAnswer) {
        answerCall();
      }
    },
    [
      answerCall,
      attachRemoteAudio,
      autoAnswer,
      clearSession,
      playHangupTone,
      setCallNumber,
      setCallStartedAt,
      setSession,
      setSipState,
      stopRingbackTone,
      t,
      watchIceGathering,
    ],
  );

  const startUa = useCallback(
    (register: boolean) => {
      if (uaRef.current) {
        uaRef.current.stop();
        uaRef.current = null;
      }

      if (!host || !port || !user) {
        setSipState((prev) => ({
          ...prev,
          sipStatus: SipStatusEnum.DISCONNECTED,
          sipErrorType: null,
          sipErrorMessage: null,
        }));
        return;
      }

      let ua: JsSIP.UA;
      try {
        ua = new JsSIP.UA({
          uri: `sip:${user}@${host}`,
          password,
          sockets: [
            new JsSIP.WebSocketInterface(`wss://${host}:${port}${pathname}`),
          ],
          register,
        });
        if (debug) {
          JsSIP.debug.enable('JsSIP:*');
        } else {
          JsSIP.debug.disable();
        }
      } catch (error) {
        logger.debug('Error', error);
        setSipState((prev) => ({
          ...prev,
          sipStatus: SipStatusEnum.ERROR,
          sipErrorType: SipErrorTypeEnum.CONFIGURATION,
          sipErrorMessage: error instanceof Error ? error.message : null,
        }));
        return;
      }
      uaRef.current = ua;

      ua.on('connecting', () => {
        if (uaRef.current !== ua) return;
        setSipState((prev) => ({
          ...prev,
          sipStatus: SipStatusEnum.CONNECTING,
          sipErrorType: null,
          sipErrorMessage: null,
        }));
      });

      ua.on('connected', () => {
        if (uaRef.current !== ua) return;
        setSipState((prev) => ({
          ...prev,
          sipStatus: SipStatusEnum.CONNECTED,
          sipErrorType: null,
          sipErrorMessage: null,
        }));
      });

      // JsSIP reconnects the WebSocket by itself; restarting the UA here
      // would drop a call that is still flowing over the media path.
      ua.on('disconnected', () => {
        if (uaRef.current !== ua) return;
        setSipState((prev) => ({
          ...prev,
          sipStatus: SipStatusEnum.ERROR,
          sipErrorType: SipErrorTypeEnum.CONNECTION,
          sipErrorMessage: 'disconnected',
        }));
      });

      // Fires on every REGISTER refresh too, so it must leave a live call be.
      ua.on('registered', () => {
        if (uaRef.current !== ua) return;
        setSipState((prev) => ({
          ...prev,
          sipStatus: SipStatusEnum.REGISTERED,
          callStatus: rtcSessionRef.current
            ? prev.callStatus
            : CallStatusEnum.IDLE,
        }));
      });

      ua.on('unregistered', () => {
        if (uaRef.current !== ua) return;
        const hasSession = !!rtcSessionRef.current;
        setSipState((prev) => ({
          ...prev,
          sipStatus: ua.isConnected()
            ? SipStatusEnum.CONNECTED
            : SipStatusEnum.DISCONNECTED,
          callStatus: hasSession ? prev.callStatus : CallStatusEnum.IDLE,
          callDirection: hasSession ? prev.callDirection : null,
        }));
      });

      ua.on('registrationFailed', (data) => {
        if (uaRef.current !== ua) return;
        setSipState((prev) => ({
          ...prev,
          sipStatus: SipStatusEnum.ERROR,
          sipErrorType: SipErrorTypeEnum.REGISTRATION,
          sipErrorMessage: data?.cause || '',
        }));
      });

      ua.on('newRTCSession', (event: RTCSessionEvent) => {
        if (uaRef.current !== ua) return;
        handleNewSession(event);
      });

      const extraHeadersRegister = extraHeaders.register || [];
      if (extraHeadersRegister.length) {
        ua.registrator().setExtraHeaders(extraHeadersRegister);
      }
      ua.start();
    },
    [
      host,
      port,
      user,
      pathname,
      password,
      debug,
      extraHeaders.register,
      setSipState,
      handleNewSession,
    ],
  );

  const reconnectSip = useCallback(
    (options?: ReconnectSipOptions) => {
      if (rtcSessionRef.current) {
        // Never stop the UA under a live call; nudge the transport instead.
        uaRef.current?.start();
        return;
      }
      startUa(options?.register ?? !callInfoRef.current?.isUnregistered);
    },
    [startUa],
  );

  // Initialize audio element and JsSIP on mount
  useEffect(() => {
    if (document.getElementById('sip-provider-audio')) {
      throw new Error(
        'Creating two SipProviders in one application is forbidden',
      );
    }

    const audioElement = document.createElement('audio');
    audioElement.id = 'sip-provider-audio';
    document.body.appendChild(audioElement);
    remoteAudioRef.current = audioElement;
    startUa(!callInfoRef.current?.isUnregistered);
    return () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.parentNode?.removeChild(remoteAudioRef.current);
        remoteAudioRef.current = null;
      }
      if (uaRef.current) {
        uaRef.current.stop();
        uaRef.current = null;
      }
    };
    // Only a new account restarts the UA here; Reconnect picks up the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, port, user]);

  const answering = !!answeringSession && answeringSession === rtcSessionState;

  // Desktop app bridge: a no-op in a plain browser.
  const commandRef = useRef<(command: DesktopPhoneCommand) => void>(() => {
    return;
  });
  commandRef.current = (command) => {
    if (command.type === 'answer') answerCall();
    if (command.type === 'hangUp') stopCall();
    if (command.type === 'mute') (media.muted ? unmute : mute)();
    if (command.type === 'hold') (media.held ? unhold : hold)();
    if (command.type === 'openPhone' || command.type === 'dial') {
      setWidgetOpen(true);
    }
    if (command.type === 'dial') {
      setCallNumber(command.number);
      if (
        (sipState.sipStatus === SipStatusEnum.CONNECTED ||
          sipState.sipStatus === SipStatusEnum.REGISTERED) &&
        sipState.callStatus === CallStatusEnum.IDLE
      ) {
        startCall(command.number);
      }
    }
  };

  useEffect(() => {
    const desktop = window.erxesDesktop;
    if (!desktop) return;
    const unsubscribe = desktop.onCommand((command) =>
      commandRef.current(command),
    );
    return () => {
      unsubscribe();
      desktop.phone(null);
    };
  }, []);

  const { sipStatus, callStatus, callDirection, callCounterpart } = sipState;
  useEffect(() => {
    const desktop = window.erxesDesktop;
    if (!desktop) return;
    const status =
      sipStatus === SipStatusEnum.REGISTERED
        ? 'ready'
        : sipStatus === SipStatusEnum.CONNECTING ||
          (sipStatus === SipStatusEnum.CONNECTED && !callInfo?.isUnregistered)
        ? 'connecting'
        : 'offline';
    desktop.phone({
      language: i18n.language,
      status,
      call:
        callStatus === CallStatusEnum.IDLE || !callDirection
          ? null
          : {
              number: extractPhoneNumberFromCounterpart(callCounterpart || ''),
              name: null,
              direction:
                callDirection === CallDirectionEnum.INCOMING
                  ? 'incoming'
                  : 'outgoing',
              talking: callStatus === CallStatusEnum.ACTIVE,
              since: callStartedAt?.getTime() ?? null,
              muted: media.muted,
              held: media.held,
            },
      queues: [],
    });
  }, [
    i18n.language,
    sipStatus,
    callStatus,
    callDirection,
    callCounterpart,
    callStartedAt,
    callInfo?.isUnregistered,
    media,
  ]);

  const contextValue = useMemo(
    () => ({
      registerSip,
      unregisterSip,
      reconnectSip,
      answerCall,
      answering,
      startCall,
      stopCall,
      muted: media.muted,
      mute,
      unmute,
      sendDtmf,
      held: media.held,
      hold,
      unhold,
    }),
    [
      registerSip,
      unregisterSip,
      reconnectSip,
      answerCall,
      answering,
      startCall,
      stopCall,
      media,
      mute,
      unmute,
      sendDtmf,
      hold,
      unhold,
    ],
  );

  return (
    <SipContext.Provider value={contextValue}>{children}</SipContext.Provider>
  );
};

// Custom hook to use SIP context
export const useSip = () => {
  const context = useContext(SipContext);
  if (!context) {
    throw new Error('useSip must be used within a SipProvider');
  }
  return context;
};
