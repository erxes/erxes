import {
  Actions,
  CallAction,
  InCallFooter,
  InnerActions,
  Keypad,
} from './styles';
import { numbers, symbols } from './constants';

import DialogComponent from './components/Dialog';
import { Icon } from '@erxes/ui/src/components';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import moment from 'moment';

export const formatPhone = (phone) => {
  var num;
  if (phone.indexOf('@')) {
    num = phone.split('@')[0];
  } else {
    num = phone;
  }
  // remove everything but digits & '+' sign
  num = num.toString().replace(/[^+0-9]/g, '');

  return num;
};

const formatNumber = (n: number) => {
  return n.toLocaleString('en-US', {
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
      <div className="symbols" onClick={() => handNumPad('delete')}>
        <Icon icon="backspace" />
      </div>
    </Keypad>
  );
};

export const callActions = (
  isMuted,
  handleAudioToggle,
  endCall,
  inboxId,
  disableTransferCall,
  direction,
  gotoDetail,
  disableDetail,
) => {
  return (
    <InCallFooter>
      <Actions>
        <InnerActions>
          <div>
            <CallAction
              key={isMuted() ? 'UnMute' : 'Mute'}
              $active={isMuted()}
              onClick={handleAudioToggle}
            >
              <Icon size={20} icon={'phone-times'} />
            </CallAction>
            {isMuted() ? __('UnMute') : __('Mute')}
          </div>
          <div>
            <DialogComponent
              title="Transfer call"
              inboxId={inboxId}
              disabled={disableTransferCall}
              direction={direction}
            />

            {__('Transfer')}
          </div>
          <div>
            <CallAction onClick={gotoDetail} $disabled={disableDetail}>
              <Icon size={20} icon={'book-alt'} />
            </CallAction>

            {__('Detail')}
          </div>
        </InnerActions>
        <div>
          <CallAction onClick={endCall} $isDecline={true}>
            <Icon size={20} icon="phone-slash" />
          </CallAction>
          {__('End Call')}
        </div>
      </Actions>
    </InCallFooter>
  );
};

export const setLocalStorage = (isRegistered, isAvailable) => {
  localStorage.setItem(
    'callInfo',
    JSON.stringify({
      isRegistered,
    }),
  );

  const callConfig = JSON.parse(
    localStorage.getItem('config:call_integrations') || '{}',
  );

  callConfig &&
    localStorage.setItem(
      'config:call_integrations',
      JSON.stringify({
        inboxId: callConfig.inboxId,
        phone: callConfig.phone,
        wsServer: callConfig.wsServer,
        token: callConfig.token,
        operators: callConfig.operators,
        isAvailable,
      }),
    );
};

export const calculateTimeElapsed = (startedMoment) => {
  const now = moment(new Date());
  return now.diff(startedMoment, 'seconds');
};
export const extractPhoneNumberFromCounterpart = (counterpart) => {
  if (!counterpart) return '';
  const startIndex = counterpart.indexOf(':') + 1;
  const endIndex = counterpart.indexOf('@');
  if (startIndex >= endIndex || startIndex === -1 || endIndex === -1) return '';
  return counterpart.slice(startIndex, endIndex);
};
