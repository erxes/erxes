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
  KeypadHeader,
  NameCardContainer,
  NumberInput,
  PhoneNumber,
} from '../styles';
import { Button, Icon } from '@erxes/ui/src/components';
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
import { ICallConversation, ICustomer } from '../types';
import React, { useEffect, useState } from 'react';
import { callActions, formatPhone, getSpentTime, renderKeyPad } from '../utils';
import { callPropType, sipPropType } from '../lib/types';

import { FormControl } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';
import { renderFullName } from '@erxes/ui/src/utils/core';

type Props = {
  addCustomer: (firstName: string, phoneNumber: string, callID: string) => void;
  callUserIntegrations: any;
  setConfig: any;
  customer: ICustomer;
  toggleSectionWithPhone: (phoneNumber: string) => void;
  taggerRefetchQueries: any;
  conversation: ICallConversation;
  addNote: (conversationId: string, content: string) => void;
  disconnectCall: () => void;
  phoneNumber: string;
};

const KeyPad = (props: Props, context) => {
  const Sip = context;
  const { call, mute, unmute, isMuted, isHolded, hold, unhold } = Sip;
  const {
    addCustomer,
    callUserIntegrations,
    setConfig,
    customer,
    conversation,
    phoneNumber,
  } = props;

  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations',
  );

  const [currentTab, setCurrentTab] = useState('');
  const [shrink, setShrink] = useState(customer ? true : false);

  const [number, setNumber] = useState(phoneNumber ? phoneNumber : '');
  const [dialCode, setDialCode] = useState('');

  const [showTrigger, setShowTrigger] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [callFrom, setCallFrom] = useState(
    JSON.parse(defaultCallIntegration || '{}')?.phone ||
      callUserIntegrations?.[0]?.phone ||
      '',
  );
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const formatedPhone = formatPhone(number);

  const ourPhone = callUserIntegrations?.map((user) => ({
    value: user.phone,
    label: user.phone,
  }));
  let conversationDetail;

  if (conversation) {
    conversationDetail = {
      ...conversation,
      _id: conversation.erxesApiId,
    };
  }

  useEffect(() => {
    let timer;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
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
      const inboxId =
        JSON.parse(defaultCallIntegration || '{}')?.inboxId ||
        callUserIntegrations?.[0]?.inboxId;

      addCustomer(inboxId, formatedPhone, call?.id);
    }
    if (call?.status === CALL_STATUS_ACTIVE) {
      timer = setInterval(() => {
        setTimeSpent((prevTimeSpent) => prevTimeSpent + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [call?.status]);

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
      }),
    );
    setConfig({
      inboxId: integration?.inboxId,
      phone: integration?.phone,
      wsServer: integration?.wsServer,
      token: integration?.token,
      operators: integration?.operators,
      isAvailable: isConnected ? true : false,
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

    if (e === 'delete') {
      num = number.slice(0, -1);
      dialNumber = dialCode.slice(0, -1);
      if (Sip.call?.status === CALL_STATUS_ACTIVE) {
        setDialCode(dialNumber);
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
        if (dialNumber.includes('*') && sendDtmf) {
          sendDtmf(dialNumber);
          setDialCode(dialNumber);
        }
      } else {
        setNumber(num);
      }
    }
  };

  const handleKeyDown = (event) => {
    const keyValue = event.key;

    if (/^[0-9]$/.test(keyValue)) {
      setNumber((prevNumber) => prevNumber + keyValue);
    } else if (
      (keyValue === 'Delete' || keyValue === 'Backspace') &&
      number.length > 0
    ) {
      setNumber((prevNumber) => prevNumber.slice(0, -1));
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
      }),
    );

    setConfig({
      inboxId: integration?.inboxId,
      phone: integration?.phone,
      wsServer: integration?.wsServer,
      token: integration?.token,
      operators: integration?.operators,
      isAvailable: true,
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
          {renderFullName(customer || '')}
          <PhoneNumber shrink={shrink}>{showNumber}</PhoneNumber>
        </>
      );
    }

    return <PhoneNumber shrink={shrink}>{showNumber}</PhoneNumber>;
  };

  const isConnected =
    !Sip.call ||
    Sip.sip?.status === SIP_STATUS_ERROR ||
    Sip.sip?.status === SIP_STATUS_DISCONNECTED;

  if (
    Sip.call?.direction === CALL_DIRECTION_OUTGOING &&
    Sip.call?.status === CALL_STATUS_STARTING
  ) {
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
              isHolded,
              handleHold,
              handleCallStop,
            )}
          </IncomingContent>
        </IncomingContainer>
      </IncomingCallNav>
    );
  }

  if (Sip.call?.status === CALL_STATUS_ACTIVE) {
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
              isHolded,
              handleHold,
              handleCallStop,
            )}
          </IncomingContent>
        </IncomingContainer>
      </IncomingCallNav>
    );
  }

  return (
    <>
      {Sip.call?.direction !== CALL_DIRECTION_INCOMING && (
        <NumberInput>
          <KeypadHeader>
            <HeaderItem>
              <Icon
                className={isConnected ? 'off' : 'on'}
                icon="signal-alt-3"
              />
              {isConnected ? __('Offline') : __('Online')}
            </HeaderItem>
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
                icon={isConnected ? 'power-button' : 'pause-1'}
              />
              {isConnected ? __('Turn on') : __('Turn off')}
            </HeaderItem>
          </KeypadHeader>
          <InputBar type="keypad">
            <FormControl
              placeholder={__('Enter Phone Number')}
              name="searchValue"
              value={number}
              onKeyDown={handleKeyDown}
              autoFocus={true}
              defaultValue={number}
            />
          </InputBar>
          {renderKeyPad(handNumPad)}
          <p>{__('Calling from your own phone number')}</p>
          <Select
            placeholder={__('Choose phone number')}
            value={callFrom}
            onChange={onStatusChange}
            clearable={false}
            options={ourPhone}
            scrollMenuIntoView={true}
          />
          <>
            {Sip.sip?.status === SIP_STATUS_REGISTERED && (
              <>
                <Button
                  btnStyle="success"
                  icon="outgoing-call"
                  onClick={handleCall}
                >
                  {Sip.call?.status === CALL_STATUS_IDLE
                    ? 'Call'
                    : Sip.call?.status === CALL_STATUS_STARTING
                      ? 'Calling'
                      : 'aa'}
                </Button>
              </>
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
  isHolded: PropTypes.func,
  sendDtmf: PropTypes.func,
};

export default KeyPad;
