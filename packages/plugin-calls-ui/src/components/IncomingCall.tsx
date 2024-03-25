import * as PropTypes from "prop-types";

import { Alert, __ } from "@erxes/ui/src/utils";
import {
  CallButton,
  IncomingActionButton,
  IncomingButtonContainer,
  IncomingCallNav,
  IncomingContainer,
  IncomingContent,
  NameCardContainer,
  PhoneNumber,
} from "../styles";
import { ICallConversation, ICustomer } from "../types";
import React, { useEffect, useRef, useState } from "react";
import { callPropType, sipPropType } from "../lib/types";

import Avatar from "@erxes/ui/src/components/nameCard/Avatar";
import { CALL_STATUS_IDLE } from "../lib/enums";
import Icon from "@erxes/ui/src/components/Icon";
import { callActions } from "../utils";
import { caller } from "../constants";
import { renderFullName } from "@erxes/ui/src/utils/core";

type Props = {
  customer: ICustomer;
  conversation: ICallConversation;
  toggleSectionWithPhone: (phoneNumber: string) => void;
  taggerRefetchQueries: any;
  hasMicrophone: boolean;
  addNote: (conversationId: string, content: string) => void;
};

const getSpentTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);

  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);

  seconds -= minutes * 60;

  return (
    <>
      {hours !== 0 && formatNumber(hours)}
      {hours !== 0 && <span> : </span>}
      {formatNumber(minutes)}
      <span> : </span>
      {formatNumber(seconds)}
    </>
  );
};

const formatNumber = (n: number) => {
  return n.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
};

const IncomingCall = (props: Props, context) => {
  const Sip = context;
  const { mute, unmute, isMuted, isHolded, hold, unhold } = Sip;
  const { customer, conversation, hasMicrophone } = props;
  const primaryPhone = customer?.primaryPhone || "";

  const [haveIncomingCall, setHaveIncomingCall] = useState(
    primaryPhone ? true : false
  );
  const [timeSpent, setTimeSpent] = useState(0);
  const [status, setStatus] = useState("pending");

  let conversationDetail;

  if (conversation) {
    conversationDetail = {
      ...conversation,
      _id: conversation.erxesApiId,
    };
  }
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (audioRef.current) {
      audioRef.current.src = "/sound/incoming.mp3";
      audioRef.current.play();
    }
    if (status === "accepted") {
      timer = setInterval(() => {
        setTimeSpent((prevTimeSpent) => prevTimeSpent + 1);
      }, 1000);
    }
    if (status !== "accepted") {
      setHaveIncomingCall(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      clearInterval(timer);
    };
  }, [status, primaryPhone, audioRef.current]);

  const endCall = () => {
    onDeclineCall();
  };

  const onAcceptCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (!hasMicrophone) {
      return Alert.error("Check your microphone");
    }

    setStatus("accepted");
    const { answerCall, call } = context;
    setHaveIncomingCall(false);
    if (answerCall && call?.status !== CALL_STATUS_IDLE) {
      answerCall();
    }
  };

  const onDeclineCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    setHaveIncomingCall(false);
    const { stopCall } = context;

    if (stopCall) {
      stopCall();
    }
  };

  const handleAudioToggle = () => {
    if (!isMuted()) {
      mute();
    } else {
      unmute();
    }
  };

  const handleHold = () => {
    if (!isHolded().localHold) {
      hold();
    } else {
      unhold();
    }
  };

  const renderUserInfo = (type?: string) => {
    const inCall = type === "incall" ? true : false;
    const hasChannel = conversationDetail?.channels?.length > 0;
    const channelName = conversationDetail?.channels?.[0]?.name || "";

    return (
      <NameCardContainer>
        <h5>{__("Call")}</h5>
        <Avatar user={customer} size={inCall ? 72 : 30} />
        <h4>{renderFullName(customer || "", true)}</h4>
        {primaryPhone && (
          <PhoneNumber>
            {primaryPhone}
            {hasChannel && (
              <span>
                {__("is calling to")} {channelName}
              </span>
            )}
            <h5>{caller.place}</h5>
          </PhoneNumber>
        )}
      </NameCardContainer>
    );
  };

  if (haveIncomingCall) {
    return (
      <>
        <audio ref={audioRef} loop autoPlay />
        <IncomingCallNav>
          <IncomingContainer>
            <IncomingContent>
              {renderUserInfo()}
              <IncomingButtonContainer>
                <div>
                  <IncomingActionButton onClick={onAcceptCall} type="accepted">
                    <Icon icon="phone-alt" size={20} />
                  </IncomingActionButton>
                  <b>{__("Accept")}</b>
                </div>
                <div>
                  <IncomingActionButton onClick={onDeclineCall} type="decline">
                    <Icon icon="phone-slash" size={20} />
                  </IncomingActionButton>
                  <b>{__("Decline")}</b>
                </div>
              </IncomingButtonContainer>
            </IncomingContent>
          </IncomingContainer>
        </IncomingCallNav>
      </>
    );
  }

  if (status === "accepted" && !haveIncomingCall) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    return (
      hasMicrophone && (
        <IncomingCallNav>
          <IncomingContainer>
            <IncomingContent>
              {renderUserInfo("incall")}
              <p>
                {__("Call duration:")} <b>{getSpentTime(timeSpent)}</b>
              </p>
              {callActions(
                isMuted,
                handleAudioToggle,
                isHolded,
                handleHold,
                endCall
              )}
            </IncomingContent>
          </IncomingContainer>
        </IncomingCallNav>
      )
    );
  }

  return null;
};

IncomingCall.contextTypes = {
  sip: sipPropType,
  call: callPropType,
  startCall: PropTypes.func,
  stopCall: PropTypes.func,
  answerCall: PropTypes.func,
  mute: PropTypes.func,
  unmute: PropTypes.func,
  hold: PropTypes.func,
  unhold: PropTypes.func,
  isMuted: PropTypes.func,
  isHolded: PropTypes.func,
};

export default IncomingCall;
