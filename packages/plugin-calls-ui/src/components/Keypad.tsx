import React, { useState, useEffect } from 'react';
import {
  InputBar,
  NumberInput,
  BackIcon,
  ChooseCountry,
  InCall,
  CallInfo,
  PhoneNumber,
  ContactItem,
  CallTabsContainer,
  CallTab,
  DisconnectCall,
} from '../styles';
import { inCallTabs } from '../constants';
import { FormControl } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';
import { Button, Icon } from '@erxes/ui/src/components';
import { Alert, __ } from '@erxes/ui/src/utils';
import * as PropTypes from 'prop-types';
import {
  CALL_DIRECTION_INCOMING,
  CALL_STATUS_ACTIVE,
  CALL_STATUS_IDLE,
  CALL_STATUS_STARTING,
  SIP_STATUS_DISCONNECTED,
  SIP_STATUS_ERROR,
  SIP_STATUS_REGISTERED,
} from '../lib/enums';
import { callPropType, sipPropType } from '../lib/types';
import {
  callActions,
  formatPhone,
  getSpentTime,
  renderFooter,
  renderKeyPad,
} from '../utils';
import Popover from 'react-bootstrap/Popover';
import { ICallConversation, ICustomer } from '../types';

type Props = {
  addCustomer: (firstName: string, phoneNumber: string, callID: string) => void;
  callIntegrationsOfUser: any;
  setConfig: any;
  customer: ICustomer;
  toggleSectionWithPhone: (phoneNumber: string) => void;
  taggerRefetchQueries: any;
  conversation: ICallConversation;
  addNote: (conversationId: string, content: string) => void;
  disconnectCall: () => void;
};
const KeyPad = (props: Props, context) => {
  const Sip = context;
  const { call, mute, unmute, isMuted, isHolded, hold, unhold } = Sip;
  const {
    addCustomer,
    callIntegrationsOfUser,
    setConfig,
    customer,
    toggleSectionWithPhone,
    taggerRefetchQueries,
    conversation,
    addNote,
  } = props;

  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations',
  );

  const [currentTab, setCurrentTab] = useState('');
  const [shrink, setShrink] = useState(customer ? true : false);

  const [number, setNumber] = useState('');
  const [dialCode, setDialCode] = useState('');

  const [showTrigger, setShowTrigger] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [callFrom, setCallFrom] = useState(
    JSON.parse(defaultCallIntegration)?.phone ||
      callIntegrationsOfUser?.[0]?.phone ||
      '',
  );
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const [timeSpent, setTimeSpent] = useState(0);
  const formatedPhone = formatPhone(number);

  const ourPhone = callIntegrationsOfUser?.map((user) => ({
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

    if (call?.status === CALL_STATUS_STARTING && hasMicrophone) {
      const inboxId =
        JSON.parse(defaultCallIntegration)?.inboxId ||
        callIntegrationsOfUser?.[0]?.inboxId;

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

  const onTabClick = (tab: string) => {
    setCurrentTab(tab);
    setShrink(true);
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

    if (formatedPhone.length !== 8) {
      return Alert.warning('Check phone number');
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

  const handleCallConnect = () => {
    const integration = callIntegrationsOfUser?.find(
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
    localStorage.setItem('isConnectCallRequested', 'true');
    localStorage.setItem(
      'callInfo',
      JSON.stringify({
        isUnRegistered: false,
      }),
    );
  };

  const handleCallDisConnect = () => {
    const integration = callIntegrationsOfUser?.find(
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
        isAvailable: false,
      }),
    );
    setConfig({
      inboxId: integration?.inboxId,
      phone: integration?.phone,
      wsServer: integration?.wsServer,
      token: integration?.token,
      operators: integration?.operators,
      isAvailable: false,
    });
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

  const toggleSection = () => {
    toggleSectionWithPhone(formatedPhone);
  };

  const onBack = () => setShowTrigger(false);
  const onTrigger = () => setShowTrigger(true);

  const search = (e) => {
    const inputValue = e.target.value;
    setSearchValue(inputValue);
  };

  const onStatusChange = (status) => {
    setCallFrom(status.value);

    const integration = callIntegrationsOfUser?.find(
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
    return <PhoneNumber>{showNumber}</PhoneNumber>;
  };

  const onChangeText = (e) =>
    setNoteContent((e.currentTarget as HTMLInputElement).value);

  const sendMessage = () => {
    addNote(conversationDetail?._id, noteContent);
  };

  return (
    <>
      {Sip.call?.status === CALL_STATUS_ACTIVE && (
        <Popover id="call-popover" className="call-popover">
          <InCall>
            <CallInfo shrink={shrink}>
              <p>
                {__('Call duration:')} <b>{getSpentTime(timeSpent)}</b>
              </p>
              <div>{renderCallerInfo()}</div>
              {callActions(isMuted, handleAudioToggle, isHolded, handleHold)}
            </CallInfo>
            <ContactItem>
              <CallTabsContainer full={true}>
                {inCallTabs.map((tab) => (
                  <CallTab
                    key={tab}
                    className={currentTab === tab ? 'active' : ''}
                    onClick={() => onTabClick(tab)}
                  >
                    {__(tab)}
                  </CallTab>
                ))}
              </CallTabsContainer>
            </ContactItem>
            {renderFooter(
              shrink,
              handleCallStop,
              currentTab,
              onChangeText,
              sendMessage,
              customer,
              taggerRefetchQueries,
              toggleSection,
              conversationDetail,
              handNumPad,
              true,
            )}
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
              onKeyDown={handleKeyDown}
              autoFocus={true}
            />
          </InputBar>
          {renderKeyPad(handNumPad)}
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
            {Sip.call?.status === CALL_STATUS_IDLE &&
              Sip.sip?.status === SIP_STATUS_REGISTERED && (
                <>
                  <Button icon="outgoing-call" onClick={handleCall}>
                    Call
                  </Button>
                  <DisconnectCall>
                    <Button
                      btnStyle="danger"
                      icon="signal-slash"
                      onClick={handleCallDisConnect}
                    >
                      Disconnect Call
                    </Button>
                  </DisconnectCall>
                </>
              )}
            {Sip.call && Sip.call?.status !== CALL_STATUS_IDLE && (
              <Button
                icon="phone-slash"
                btnStyle="danger"
                onClick={handleCallStop}
              >
                End Call
              </Button>
            )}
            {(!Sip.call ||
              Sip.sip?.status === SIP_STATUS_ERROR ||
              Sip.sip?.status === SIP_STATUS_DISCONNECTED) && (
              <Button btnStyle="success" onClick={handleCallConnect}>
                Connect to Call
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
  isHolded: PropTypes.func,
  sendDtmf: PropTypes.func,
};
export default KeyPad;
