import * as PropTypes from 'prop-types';

import { Alert, __ } from '@erxes/ui/src/utils';
import {
  BackIcon,
  ChooseCountry,
  HeaderItem,
  IncomingCallNav,
  IncomingContainer,
  IncomingContent,
  InputBar,
  KeyPadContainer,
  KeyPadFooter,
  KeypadHeader,
  NameCardContainer,
  NumberInput,
  PhoneNumber,
} from '../styles';
import {
  CALL_DIRECTION_INCOMING,
  CALL_DIRECTION_OUTGOING,
  CALL_STATUS_ACTIVE,
  CALL_STATUS_IDLE,
  CALL_STATUS_STARTING,
  SIP_STATUS_DISCONNECTED,
  SIP_STATUS_ERROR,
  SIP_STATUS_REGISTERED,
} from '../lib/enums';
import React, { useEffect, useRef, useState } from 'react';
import {
  calculateTimeElapsed,
  callActions,
  endCallOption,
  formatPhone,
  getSpentTime,
  renderKeyPad,
} from '../utils';
import { callPropType, sipPropType } from '../lib/types';

import Button from '@erxes/ui/src/components/Button';
import { FormControl } from '@erxes/ui/src/components/form';
import { ICustomer } from '../types';
import Icon from '@erxes/ui/src/components/Icon';
import Select from 'react-select';
import Spinner from '@erxes/ui/src/components/Spinner';
import { renderFullName } from '@erxes/ui/src/utils/core';
import { useNavigate } from 'react-router-dom';

type Props = {
  addCustomer: (inboxId: string, phoneNumber: string) => void;
  callUserIntegrations: any;
  setConfig: any;
  customer: ICustomer;
  disconnectCall: () => void;
  phoneNumber: string;
  pauseExtention: (inboxId: string, status: string) => void;
  agentStatus: string;
  loading: boolean;
  currentCallConversationId: string;
};

const KeyPad = (props: Props, context) => {
  const Sip = context;
  const inputRef = useRef<any>(null);
  const navigate = useNavigate();
  // const outgoingAudio = useRef(new Audio("/sound/outgoing.mp3"));
  // const pickupAudio = useRef(new Audio("/sound/pickup.mp3"));
  // const hangupAudio = useRef(new Audio("/sound/hangup.mp3"));

  const { call, mute, unmute, isMuted } = Sip;
  const {
    addCustomer,
    callUserIntegrations,
    setConfig,
    customer,
    phoneNumber,
    pauseExtention,
    agentStatus,
    currentCallConversationId,
    loading,
  } = props;

  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations',
  );

  const [selectFocus, setSelectFocus] = useState(false);
  const [number, setNumber] = useState(phoneNumber || '');
  const [code, setCode] = useState('0');
  const [dialCode, setDialCode] = useState('');
  // const [ringingSound, setRingingSound] = useState(false);

  const [showTrigger, setShowTrigger] = useState(false);
  const [showKeyPad, setShowKeyPad] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [callFrom, setCallFrom] = useState(
    JSON.parse(defaultCallIntegration || '{}')?.phone ||
      callUserIntegrations?.[0]?.phone ||
      '',
  );
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [timeSpent, setTimeSpent] = useState(
    call?.startTime ? calculateTimeElapsed(call.startTime) : 0,
  );
  const [isPaused, setPaused] = useState(!!(agentStatus === 'paused'));

  const shrink = customer ? true : false;

  const formatedPhone = formatPhone(number);
  const ourPhone = callUserIntegrations?.map((user) => ({
    value: user.phone,
    label: user.phone,
  }));
  const inboxId =
    JSON.parse(defaultCallIntegration || '{}')?.inboxId ||
    callUserIntegrations?.[0]?.inboxId;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectFocus]);

  useEffect(() => {
    setNumber(phoneNumber);
    setPaused(agentStatus === 'pause' ? true : false);
  }, [phoneNumber, loading]);

  useEffect(() => {
    let timer;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(() => {
        setHasMicrophone(true);
      })
      .catch((error) => {
        const errorMessage = error
          ?.toString()
          .replace('DOMException:', '')
          .replace('NotFoundError: ', '');
        setHasMicrophone(false);
        return Alert.error(errorMessage);
      });

    if (
      (call?.direction === CALL_DIRECTION_OUTGOING && call?.status) ===
        CALL_STATUS_STARTING &&
      hasMicrophone
    ) {
      // setRingingSound(true);
      addCustomer(inboxId, formatedPhone);
    }
    if (call?.status === CALL_STATUS_ACTIVE) {
      const { startTime } = call;
      // setRingingSound(false);

      // const audio = pickupAudio.current;
      // audio.play();

      if (startTime) {
        timer = setInterval(() => {
          const diff = calculateTimeElapsed(startTime);
          setTimeSpent(diff);
        }, 1000);
      }
    }
    if (call?.status !== CALL_STATUS_ACTIVE) {
      localStorage.removeItem('transferredCallStatus');
    }

    return () => {
      clearInterval(timer);
    };
  }, [call?.status]);

  const onClickKeyPad = () => {
    setShowKeyPad(!showKeyPad);
  };

  const handleCall = () => {
    if (!hasMicrophone) {
      return Alert.error('Check your microphone');
    }

    if (Sip.sip?.status !== SIP_STATUS_REGISTERED) {
      return;
    }
    if (Sip.call?.status !== CALL_STATUS_IDLE) {
      return;
    }
    const { startCall } = context;
    if (startCall && hasMicrophone) {
      startCall(formatedPhone);
    }
  };

  const handleCallStop = () => {
    const { stopCall } = context;
    if (stopCall) {
      stopCall();
    }
  };

  const handleCallConnect = (status: string) => {
    const isConnected = status === 'connect';

    const integration = callUserIntegrations?.find(
      (userIntegration) => userIntegration.phone === callFrom,
    );
    localStorage.setItem(
      'config:call_integrations',
      JSON.stringify({
        inboxId: integration?.inboxId,
        phone: integration?.phone,
        wsServer: integration?.wsServer,
        token: integration?.token,
        operators: integration?.operators,
        isAvailable: isConnected ? true : false,
        queues: integration?.queues || [],
      }),
    );
    setConfig({
      inboxId: integration?.inboxId,
      phone: integration?.phone,
      wsServer: integration?.wsServer,
      token: integration?.token,
      operators: integration?.operators,
      isAvailable: isConnected ? true : false,
      queues: integration?.queues || [],
    });
    localStorage.setItem(
      'isConnectCallRequested',
      isConnected ? 'true' : 'false',
    ),
      localStorage.setItem(
        'callInfo',
        JSON.stringify({
          isUnRegistered: isConnected ? true : false,
        }),
      );
  };

  const handNumPad = (e) => {
    let num = number;
    let dialNumber = dialCode;

    setSelectFocus(!selectFocus);

    if (e === 'delete') {
      num = number.slice(0, -1);
      dialNumber = dialCode.slice(0, -1);
      if (Sip.call?.status === CALL_STATUS_ACTIVE) {
        setDialCode(dialNumber);
        setCode(dialNumber);
      } else {
        setNumber(num);
      }
    } else {
      // notfy by sound
      const audio = new Audio('/sound/clickNumPad.mp3');
      audio.play();

      num += e;
      if (Sip.call?.status === CALL_STATUS_ACTIVE) {
        dialNumber += e;
        const { sendDtmf } = context;
        if (sendDtmf) {
          sendDtmf(e);
          setCode(dialNumber);
          setDialCode(dialNumber);
        }
      } else {
        setNumber(num);
      }
    }
  };
  const handleKeyDown = (event) => {
    const keyValue = event.key;

    if (keyValue === 'Enter') {
      handleCall();
    }
  };

  const togglePause = () => {
    if (pauseExtention) {
      const status = isPaused ? 'unpause' : 'pause';
      pauseExtention(inboxId, status);
      setPaused(!isPaused);
    }
  };

  const onBack = () => setShowTrigger(false);
  const search = (e) => {
    const inputValue = e.target.value;
    setSearchValue(inputValue);
  };
  const onStatusChange = (status) => {
    setCallFrom(status.value);

    const integration = callUserIntegrations?.find(
      (userIntegration) => userIntegration.phone === status.value,
    );
    localStorage.setItem(
      'config:call_integrations',
      JSON.stringify({
        inboxId: integration?.inboxId,
        phone: integration?.phone,
        wsServer: integration?.wsServer,
        token: integration?.token,
        operators: integration?.operators,
        isAvailable: true,
        queues: integration?.queues || [],
      }),
    );

    setConfig({
      inboxId: integration?.inboxId,
      phone: integration?.phone,
      wsServer: integration?.wsServer,
      token: integration?.token,
      operators: integration?.operators,
      isAvailable: true,
      queues: integration?.queues || [],
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
            placeholder={__('Type to search')}
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

  const gotoDetail = () => {
    navigate(`/inbox/index?_id=${currentCallConversationId}`, {
      replace: true,
    });
  };

  const renderPause = () => {
    if (props.loading) {
      return <Spinner size={20} objective={true} height="inherit" />;
    }

    return (
      <HeaderItem onClick={togglePause}>
        <Icon
          className={isPaused ? 'on' : 'pause'}
          size={13}
          icon={isPaused ? 'play-1' : 'pause-1'}
        />
        {isPaused ? __('Un Pause') : __('Pause')}
      </HeaderItem>
    );
  };

  const renderKeyPadView = () => {
    return (
      <KeyPadContainer>
        <InputBar type="keypad">
          <input
            placeholder={__('0')}
            name="searchValue"
            value={code}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            autoComplete="off"
            type="number"
          />
        </InputBar>
        {renderKeyPad(handNumPad)}
        <KeyPadFooter>
          {endCallOption(handleCallStop, onClickKeyPad)}
        </KeyPadFooter>
      </KeyPadContainer>
    );
  };

  const renderCallerInfo = () => {
    if (!formatedPhone) {
      return null;
    }
    let showNumber = formatedPhone;
    if (Sip.call?.status === CALL_STATUS_ACTIVE && dialCode) {
      showNumber = dialCode;
    }
    if (!shrink) {
      return (
        <>
          {renderFullName(customer || '', true)}
          <PhoneNumber $shrink={shrink}>{showNumber}</PhoneNumber>
        </>
      );
    }
    return <PhoneNumber $shrink={shrink}>{showNumber}</PhoneNumber>;
  };

  const isConnected =
    !Sip.call ||
    Sip.sip?.status === SIP_STATUS_ERROR ||
    Sip.sip?.status === SIP_STATUS_DISCONNECTED;

  let direction = context.call?.direction?.split('/')[1];
  direction = direction?.toLowerCase() || '';
  if (
    Sip.call?.direction === CALL_DIRECTION_OUTGOING &&
    Sip.call?.status === CALL_STATUS_STARTING
  ) {
    if (showKeyPad) {
      return renderKeyPadView();
    }

    return (
      <IncomingCallNav type="outgoing">
        <IncomingContainer>
          <IncomingContent>
            <NameCardContainer>
              <h5>
                <Icon icon="calling" size={16} />
                {__('Calling')}
              </h5>
              <PhoneNumber>{number}</PhoneNumber>
            </NameCardContainer>
            {callActions(
              isMuted,
              handleAudioToggle,
              handleCallStop,
              inboxId,
              Sip.call?.status === CALL_STATUS_ACTIVE ? false : true,
              direction,
              gotoDetail,
              currentCallConversationId &&
                currentCallConversationId.length !== 0
                ? false
                : true,
              onClickKeyPad,
            )}
          </IncomingContent>
        </IncomingContainer>
      </IncomingCallNav>
    );
  }
  if (Sip.call?.status === CALL_STATUS_ACTIVE) {
    if (showKeyPad) {
      return renderKeyPadView();
    }

    return (
      <IncomingCallNav type="outgoing">
        <IncomingContainer>
          <IncomingContent>
            <NameCardContainer>
              <h5>{__('In Call')}</h5>
              {renderCallerInfo()}
            </NameCardContainer>
            <p>
              {__('Call duration:')} <b>{getSpentTime(timeSpent)}</b>
            </p>
            {callActions(
              isMuted,
              handleAudioToggle,
              handleCallStop,
              inboxId,
              Sip.call?.status === CALL_STATUS_ACTIVE ? false : true,
              direction,
              gotoDetail,
              currentCallConversationId &&
                currentCallConversationId.length !== 0
                ? false
                : true,
              onClickKeyPad,
            )}
          </IncomingContent>
        </IncomingContainer>
      </IncomingCallNav>
    );
  }
  if (Sip.call?.direction !== CALL_DIRECTION_INCOMING) {
    return (
      <NumberInput>
        <KeypadHeader>
          <HeaderItem>
            <Icon className={isConnected ? 'off' : 'on'} icon="signal-alt-3" />
            {isConnected ? __('Offline') : __('Online')}
          </HeaderItem>

          {renderPause()}
          <HeaderItem
            onClick={() =>
              isConnected
                ? handleCallConnect('connect')
                : handleCallConnect('disconnect')
            }
          >
            <Icon
              className={isConnected ? 'on' : 'off'}
              size={13}
              icon={'power-button'}
            />
            {isConnected ? __('Turn on') : __('Turn off')}
          </HeaderItem>
        </KeypadHeader>
        <InputBar type="keypad">
          <input
            placeholder={__('Enter Phone Number')}
            name="searchValue"
            value={number}
            onKeyDown={handleKeyDown}
            autoFocus={true}
            ref={inputRef}
            autoComplete="off"
            onChange={(e) => setNumber(e.target.value)}
            type="number"
          />
        </InputBar>
        {renderKeyPad(handNumPad)}
        <p>{__('Calling from your own phone number')}</p>
        <Select
          placeholder={__('Choose phone number')}
          value={ourPhone.find((phone) => phone.value === callFrom)}
          onChange={onStatusChange}
          isClearable={false}
          options={ourPhone}
          menuPlacement="top"
          onBlur={() => setSelectFocus(!selectFocus)}
        />
        <>
          {Sip.sip?.status === SIP_STATUS_REGISTERED && (
            <Button
              btnStyle="success"
              icon="outgoing-call"
              onClick={handleCall}
            >
              {Sip.call?.status === CALL_STATUS_IDLE
                ? 'Call'
                : Sip.call?.status === CALL_STATUS_STARTING
                  ? 'Calling'
                  : 'Stopping'}
            </Button>
          )}
        </>
      </NumberInput>
    );
  }

  return null;
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
  isHolded: PropTypes.func,
  sendDtmf: PropTypes.func,
};

export default KeyPad;
