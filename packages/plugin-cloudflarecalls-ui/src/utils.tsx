import {
  Actions,
  CallAction,
  InCallFooter,
  InnerActions,
  Keypad,
} from './styles';
import React from 'react';
import { numbers, symbols } from './constants';

import { Icon } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import moment from 'moment';

export const formatPhone = (phone) => {
  var num;
  if (phone.indexOf('@')) {
    num = phone.split('@')[0];
  } else {
    num = phone;
  }
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

export const renderKeyPad = (handNumPad, isTransparent?: boolean) => {
  return (
    <Keypad $transparent={isTransparent}>
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

export const endCallOption = (endCall, onClickKeyPad) => {
  return (
    <>
      <div>
        <CallAction onClick={endCall} $isDecline={true}>
          <Icon size={20} icon="phone-slash" />
        </CallAction>
        {__('End Call')}
      </div>
      <span onClick={onClickKeyPad}>{__('Hide Keypad')}</span>
    </>
  );
};

export const callActions = (
  audioEnabled,
  handleAudioToggle,
  endCall,
  erxesApiId,
  disableTransferCall,
  direction,
  gotoDetail,
  disableDetail,
  onClickKeyPad,
) => {
  return (
    <InCallFooter>
      <Actions>
        <InnerActions>
          <div>
            <CallAction
              key={audioEnabled ? 'UnMute' : 'Mute'}
              $active={audioEnabled ? true : false}
              onClick={() => handleAudioToggle}
            >
              <Icon size={20} icon={'phone-times'} />
            </CallAction>
            {audioEnabled ? __('UnMute') : __('Mute')}
          </div>
          <div>
            <CallAction onClick={() => gotoDetail} $disabled={disableDetail}>
              <Icon size={20} icon={'book-alt'} />
            </CallAction>

            {__('Detail')}
          </div>
          <div>
            <CallAction onClick={() => onClickKeyPad}>
              <Icon size={20} icon={'dialpad-alt'} />
            </CallAction>

            {__('Keypad')}
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

export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} sec`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes} min ${secs} sec`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours} hr ${minutes} min`;
  }
};
