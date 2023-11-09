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
  PhoneNumber,
  ContactItem,
  CallTabsContainer,
  CallTab,
  CallTabContent
} from '../styles';
import { inCallTabs, numbers, symbols } from '../constants';
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
  SIP_STATUS_REGISTERED
} from '../lib/enums';
import { callPropType, sipPropType } from '../lib/types';
import { formatPhone, getSpentTime } from '../utils';
import Popover from 'react-bootstrap/Popover';
import AssignBox from '@erxes/ui-inbox/src/inbox/containers/AssignBox';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';
import { ICallConversation, ICustomer } from '../types';

type Props = {
  addCustomer: (firstName: string, phoneNumber: string, callID: string) => void;
  callIntegrationsOfUser: any;
  setConfig: any;
  customer: ICustomer;
  toggleSectionWithPhone: (phoneNumber: string) => void;
  taggerRefetchQueries: any;
  conversation: ICallConversation;
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
    conversation
  } = props;

  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations'
  );

  const [currentTab, setCurrentTab] = useState('');
  const [shrink, setShrink] = useState(customer ? true : false);

  const [number, setNumber] = useState('');
  const [showTrigger, setShowTrigger] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [callFrom, setCallFrom] = useState(
    JSON.parse(defaultCallIntegration)?.phone ||
      callIntegrationsOfUser?.[0]?.phone ||
      ''
  );
  const [hasMicrophone, setHasMicrophone] = useState(false);

  const [timeSpent, setTimeSpent] = useState(0);
  const formatedPhone = formatPhone(number);

  const ourPhone = callIntegrationsOfUser?.map(user => ({
    value: user.phone,
    label: user.phone
  }));
  let conversationDetail;

  if (conversation) {
    conversationDetail = {
      ...conversation,
      _id: conversation.erxesApiId
    };
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setHasMicrophone(true);
      })
      .catch(error => {
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
        setTimeSpent(prevTimeSpent => prevTimeSpent + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
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
    const { stopCall, call } = context;

    if (stopCall) {
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

  const toggleSection = () => {
    toggleSectionWithPhone(formatedPhone);
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
    if (!formatedPhone) {
      return null;
    }

    return <PhoneNumber>{formatedPhone}</PhoneNumber>;
  };

  const renderFooter = () => {
    if (!shrink) {
      return (
        <InCallFooter>
          <Button btnStyle="link">{__('Add or call')}</Button>
          <CallAction onClick={handleCallStop} isDecline={true}>
            <Icon icon="phone-slash" />
          </CallAction>
          <Button btnStyle="link">{__('Transfer call')}</Button>
        </InCallFooter>
      );
    }

    return (
      <>
        <CallTabContent
          tab="Notes"
          show={currentTab === 'Notes' ? true : false}
        >
          <FormControl componentClass="textarea" placeholder="Send a note..." />
          <Button btnStyle="success">{__('Send')}</Button>
        </CallTabContent>
        <CallTabContent tab="Tags" show={currentTab === 'Tags' ? true : false}>
          {isEnabled('tags') && (
            <TaggerSection
              data={customer}
              type="contacts:customer"
              refetchQueries={taggerRefetchQueries}
              collapseCallback={toggleSection}
            />
          )}
        </CallTabContent>
        <CallTabContent
          tab="Assign"
          show={currentTab === 'Assign' ? true : false}
        >
          <AssignBox
            targets={[conversationDetail]}
            event="onClick"
            afterSave={() => {}}
          />
        </CallTabContent>
        <CallAction onClick={handleCallStop} isDecline={true}>
          <Icon icon="phone-slash" />
        </CallAction>
      </>
    );
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
            <ContactItem>
              <CallTabsContainer full={true}>
                {inCallTabs.map(tab => (
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
            {renderFooter()}
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
