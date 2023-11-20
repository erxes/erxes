import React, { useState, useEffect } from 'react';
import {
  InputBar,
  NumberInput,
  BackIcon,
  ChooseCountry,
  Keypad,
  InCall,
  CallInfo,
  Actions,
  CallAction,
  InCallFooter,
  PhoneNumber
} from '../styles';
import { numbers, symbols } from '../constants';
import { FormControl } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';
import { Button, Icon } from '@erxes/ui/src/components';
import { Alert, __ } from '@erxes/ui/src/utils';
import * as PropTypes from 'prop-types';
import {
  CALL_DIRECTION_INCOMING,
  CALL_STATUS_ACTIVE,
  CALL_STATUS_IDLE,
  SIP_STATUS_REGISTERED
} from '../lib/enums';
import { callPropType, sipPropType } from '../lib/types';
import { formatPhone, getSpentTime } from '../utils';
import Popover from 'react-bootstrap/Popover';

type Props = {
  addCustomer: (firstName: string, phoneNumber: string) => void;
  callIntegrationsOfUser: any;
  setConfig: any;
};
const KeyPad = (props: Props, context) => {
  const Sip = context;
  const { call, mute, unmute, isMuted, isHolded, hold, unhold } = Sip;

  const { addCustomer, callIntegrationsOfUser, setConfig } = props;

  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations'
  );

  const [number, setNumber] = useState('');
  const [showTrigger, setShowTrigger] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [callFrom, setCallFrom] = useState(
    JSON.parse(defaultCallIntegration)?.phone ||
      callIntegrationsOfUser?.[0]?.phone ||
      ''
  );

  const [timeSpent, setTimeSpent] = useState(0);

  const ourPhone = callIntegrationsOfUser?.map(user => ({
    value: user.phone,
    label: user.phone
  }));

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (call?.status === CALL_STATUS_ACTIVE) {
      timer = setInterval(() => {
        setTimeSpent(prevTimeSpent => prevTimeSpent + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [call?.status]);

  const handleCall = () => {
    if (Sip.sip?.status !== SIP_STATUS_REGISTERED) {
      return;
    }
    if (Sip.call?.status !== CALL_STATUS_IDLE) {
      return;
    }
    // new Audio('/sound/outgoing.mp3');
    const formatedPhone = formatPhone(number);

    if (formatedPhone.length !== 8) {
      return Alert.warning('Check phone number');
    }
    const inboxId =
      JSON.parse(defaultCallIntegration)?.inboxId ||
      callIntegrationsOfUser?.[0]?.inboxId;
    const { startCall } = context;

    if (startCall) {
      startCall(formatedPhone);
      addCustomer(inboxId, formatedPhone);
    }
  };

  const handleCallStop = () => {
    const { stopCall, call } = context;

    if (stopCall && call.status === CALL_STATUS_ACTIVE) {
      stopCall();
    }
  };

  const handNumPad = e => {
    let num = number;
    if (e === 'delete') {
      num = number.slice(0, -1);
      setNumber(num);
    } else {
      // notfy by sound
      const audio = new Audio('/sound/clickNumPad.mp3');
      audio.play();

      num += e;
      setNumber(num);
    }
  };

  const renderKeyPad = () => {
    return (
      <Keypad>
        {numbers.map(n => (
          <div className="number" key={n} onClick={() => handNumPad(n)}>
            {n}
          </div>
        ))}
        <div className="symbols">
          {symbols.map(s => (
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

  const onBack = () => setShowTrigger(false);
  const onTrigger = () => setShowTrigger(true);

  const search = e => {
    const inputValue = e.target.value;
    setSearchValue(inputValue);
  };

  const onStatusChange = status => {
    setCallFrom(status.value);

    const integration = callIntegrationsOfUser?.find(
      integration => integration.phone === status.value
    );
    localStorage.setItem(
      'config:call_integrations',
      JSON.stringify({
        inboxId: integration?.inboxId,
        phone: integration?.phone,
        wsServer: integration?.wsServer,
        token: integration?.token,
        operators: integration?.operators,
        isAvailable: true
      })
    );

    setConfig({
      inboxId: integration?.inboxId,
      phone: integration?.phone,
      wsServer: integration?.wsServer,
      token: integration?.token,
      operators: integration?.operators,
      isAvailable: true
    });
  };

  if (showTrigger) {
    return (
      <ChooseCountry>
        <BackIcon onClick={onBack}>
          <Icon icon="angle-left" size={20} /> {__('Back')}
        </BackIcon>
        <InputBar type="country">
          <Icon icon="search-1" size={20} />
          <FormControl
            placeholder={__('Search')}
            name="searchValue"
            onChange={search}
            value={searchValue}
            autoFocus={true}
          />
        </InputBar>
      </ChooseCountry>
    );
  }

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

  const renderCallerInfo = () => {
    const formatedPhone = formatPhone(number);
    if (!formatedPhone) {
      return null;
    }

    return <PhoneNumber>{formatedPhone}</PhoneNumber>;
  };

  return (
    <>
      {Sip.call?.status === CALL_STATUS_ACTIVE && (
        <Popover id="call-popover" className="call-popover">
          <InCall>
            <CallInfo shrink={false}>
              <p>
                {__('Call duration:')} <b>{getSpentTime(timeSpent)}</b>
              </p>
              <div>{renderCallerInfo()}</div>
              <Actions>
                {!isMuted() && (
                  <CallAction
                    key={'Mute'}
                    shrink={false}
                    onClick={handleAudioToggle}
                  >
                    <Icon icon={'phone-times'} />
                    {__('Mute')}
                  </CallAction>
                )}
                {isMuted() && (
                  <CallAction
                    key={'UnMute'}
                    shrink={true}
                    onClick={handleAudioToggle}
                  >
                    <Icon icon={'phone-times'} />
                    {__('UnMute')}
                  </CallAction>
                )}

                {!isHolded().localHold && (
                  <CallAction key={'Hold'} shrink={false} onClick={handleHold}>
                    <Icon icon={'pause-1'} />
                    {__('Hold')}
                  </CallAction>
                )}
                {isHolded().localHold && (
                  <CallAction key={'UnHold'} shrink={true} onClick={handleHold}>
                    <Icon icon={'pause-1'} />
                    {__('UnHold')}
                  </CallAction>
                )}
              </Actions>
            </CallInfo>

            <InCallFooter>
              <Button btnStyle="link">{__('Add or call')}</Button>
              <CallAction onClick={handleCallStop} isDecline={true}>
                <Icon icon="phone-slash" />
              </CallAction>
              <Button btnStyle="link">{__('Transfer call')}</Button>
            </InCallFooter>
          </InCall>
        </Popover>
      )}
      {Sip.call?.direction !== CALL_DIRECTION_INCOMING && (
        <NumberInput>
          <InputBar type="keypad">
            <FormControl
              placeholder={__('Enter Phone Number')}
              name="searchValue"
              value={number}
              disabled={true}
              autoFocus={true}
            />
          </InputBar>
          {renderKeyPad()}
          <p>Calling from your own phone number</p>
          <Select
            placeholder={__('Choose phone number')}
            value={callFrom}
            onChange={onStatusChange}
            clearable={false}
            options={ourPhone}
            scrollMenuIntoView={true}
          />
          <>
            {Sip.call?.status === CALL_STATUS_IDLE && (
              <Button icon="outgoing-call" onClick={handleCall}>
                Call
              </Button>
            )}
            {Sip.call?.status !== CALL_STATUS_IDLE && (
              <Button
                icon="phone-slash"
                btnStyle="danger"
                onClick={handleCallStop}
              >
                End Call
              </Button>
            )}
          </>
        </NumberInput>
      )}
    </>
  );
};
KeyPad.contextTypes = {
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
  isHolded: PropTypes.func
};
export default KeyPad;
