import { Actions, CallAction, InCallFooter, Keypad } from "./styles";
import { numbers, symbols } from "./constants";

import { Icon } from "@erxes/ui/src/components";
import React from "react";
import { __ } from "@erxes/ui/src/utils";

export const formatPhone = (phone) => {
  var num;
  if (phone.indexOf("@")) {
    num = phone.split("@")[0];
  } else {
    num = phone;
  }
  // remove everything but digits & '+' sign
  num = num.toString().replace(/[^+0-9]/g, "");

  return num;
};

const formatNumber = (n: number) => {
  return n.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
};

export const getSpentTime = (seconds: number) => {
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

export const renderKeyPad = (handNumPad) => {
  return (
    <Keypad>
      {numbers.map((n) => (
        <div className="number" key={n} onClick={() => handNumPad(n)}>
          {n}
        </div>
      ))}
      <div className="symbols">
        {symbols.map((s) => (
          <div
            key={s.class}
            className={s.class}
            onClick={() => handNumPad(s.symbol)}
          >
            {s.toShow || s.symbol}
          </div>
        ))}
      </div>
      <div className="number" onClick={() => handNumPad(0)}>
        0
      </div>
      <div className="symbols" onClick={() => handNumPad("delete")}>
        <Icon icon="backspace" />
      </div>
    </Keypad>
  );
};

export const callActions = (
  isMuted,
  handleAudioToggle,
  isHolded,
  handleHold,
  endCall
) => {
  const isHold = isHolded().localHold;

  return (
    <InCallFooter>
      <Actions>
        <div>
          <CallAction
            key={isMuted ? "UnMute" : "Mute"}
            shrink={isMuted ? true : false}
            onClick={handleAudioToggle}
          >
            <Icon icon={"phone-times"} />
          </CallAction>
          {isMuted ? __("Mute") : __("UnMute")}
        </div>
        <div>
          <CallAction
            key={isHold ? "UnHold" : "Hold"}
            shrink={isHold ? true : false}
            onClick={handleHold}
          >
            <Icon icon={"pause-1"} />
          </CallAction>
          {isHold ? __("Hold") : __("UnHold")}
        </div>
        <div>
          <CallAction>
            <Icon icon={"book-alt"} />
          </CallAction>
          {__("Detail")}
        </div>
        <div>
          <CallAction>
            <Icon icon={"phone-volume"} />
          </CallAction>
          {__("Transfer call")}
        </div>
        <CallAction onClick={endCall} isDecline={true}>
          <Icon icon="phone-slash" />
        </CallAction>
      </Actions>
    </InCallFooter>
  );
};

export const setLocalStorage = (isRegistered, isAvailable) => {
  localStorage.setItem(
    "callInfo",
    JSON.stringify({
      isRegistered,
    })
  );

  const callConfig = JSON.parse(
    localStorage.getItem("config:call_integrations") || "{}"
  );

  callConfig &&
    localStorage.setItem(
      "config:call_integrations",
      JSON.stringify({
        inboxId: callConfig.inboxId,
        phone: callConfig.phone,
        wsServer: callConfig.wsServer,
        token: callConfig.token,
        operators: callConfig.operators,
        isAvailable,
      })
    );
};
