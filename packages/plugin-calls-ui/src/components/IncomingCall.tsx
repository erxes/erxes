import * as PropTypes from "prop-types";

import { Alert, __ } from "@erxes/ui/src/utils";
import {
  CALL_STATUS_ACTIVE,
  CALL_STATUS_IDLE,
  CALL_STATUS_STARTING,
} from "../lib/enums";
import {
  IncomingActionButton,
  IncomingButtonContainer,
  IncomingCallNav,
  IncomingContainer,
  IncomingContent,
  NameCardContainer,
  PhoneNumber,
} from "../styles";
import React, { useEffect, useRef, useState } from "react";
import { callPropType, sipPropType } from "../lib/types";

import Avatar from "@erxes/ui/src/components/nameCard/Avatar";
import { ICustomer } from "../types";
import Icon from "@erxes/ui/src/components/Icon";
import { callActions } from "../utils";
import { caller } from "../constants";
import { renderFullName } from "@erxes/ui/src/utils/core";
import { useNavigate } from "react-router-dom";

type Props = {
  customer: ICustomer;
  channels: any;
  hasMicrophone: boolean;
  phoneNumber: string;
  hideIncomingCall?: boolean;
  inboxId: string;
  currentCallConversationId: string;
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
  const { mute, unmute, isMuted, isHolded, hold, unhold, call } = Sip;
  const {
    customer,
    hasMicrophone,
    phoneNumber,
    channels,
    hideIncomingCall,
    currentCallConversationId,
    inboxId,
  } = props;
  const primaryPhone = customer?.primaryPhone || "";

  const navigate = useNavigate();

  const [haveIncomingCall, setHaveIncomingCall] = useState(!!primaryPhone);
  const [timeSpent, setTimeSpent] = useState(0);
  const [status, setStatus] = useState(
    call.status === CALL_STATUS_ACTIVE ? "active" : "pending"
  );

  let direction = context.call?.direction?.split("/")[1];
  direction = direction?.toLowerCase() || "";
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
      if (call.status === CALL_STATUS_STARTING) {
        localStorage.removeItem("transferedCallStatus");
      }
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

  const gotoDetail = () => {
    navigate(`/inbox/index?_id=${currentCallConversationId}`, {
      replace: true,
    });
  };

  const renderUserInfo = (type?: string) => {
    const inCall = type === "incall";
    const hasChannel = channels?.length > 0;
    const channelName = channels?.[0]?.name || "";
    const fullName = renderFullName(customer || "", false);
    const hasGroupName = call.groupName || "";

    return (
      <NameCardContainer>
        <h5>{__("Call")}</h5>
        <Avatar user={customer} size={inCall ? 72 : 30} />
        <h4>{fullName === "Unknown" ? phoneNumber : fullName}</h4>
        {primaryPhone && (
          <PhoneNumber>
            {primaryPhone}
            {hasGroupName && (
              <span>
                {__("from")} {hasGroupName}
              </span>
            )}
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

  if (status === "accepted" && !haveIncomingCall && !hideIncomingCall) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    return hasMicrophone ? (
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
              endCall,
              inboxId,
              Sip.call?.status === CALL_STATUS_ACTIVE ? false : true,
              direction,
              gotoDetail,
              currentCallConversationId &&
                currentCallConversationId.length !== 0
                ? false
                : true
            )}
          </IncomingContent>
        </IncomingContainer>
      </IncomingCallNav>
    ) : (
      <h3>Check your microphone</h3>
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
