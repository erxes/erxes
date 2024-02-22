import Icon from '@erxes/ui/src/components/Icon';
import { Alert, __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import Popover from 'react-bootstrap/Popover';
import {
  IncomingCallNav,
  CallButton,
  InCall,
  CallInfo,
  PhoneNumber,
  Actions,
  CallAction,
  ContactItem,
  ActionNumber,
  InCallFooter,
  CallTab,
  CallTabsContainer,
  CallTabContent,
  IncomingContainer,
  IncomingButtonContainer,
  IncomingActionButton,
  NameCardContainer,
} from '../styles';
import { caller, inCallTabs } from '../constants';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import AssignBox from '@erxes/ui-inbox/src/inbox/containers/AssignBox';
import { isEnabled, renderFullName } from '@erxes/ui/src/utils/core';
import * as PropTypes from 'prop-types';
import { callPropType, sipPropType } from '../lib/types';
import { CALL_STATUS_IDLE } from '../lib/enums';
import { ICallConversation, ICustomer } from '../types';
import { ModalTrigger, Tags, Tip } from '@erxes/ui/src/components';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';

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
  return n.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
};

const IncomingCall: React.FC<Props> = (props: Props, context) => {
  const Sip = context;
  const { mute, unmute, isMuted, isHolded, hold, unhold } = Sip;
  const {
    customer,
    toggleSectionWithPhone,
    taggerRefetchQueries,
    conversation,
    hasMicrophone,
    addNote,
  } = props;
  const primaryPhone = customer?.primaryPhone;

  const [currentTab, setCurrentTab] = useState('');
  const [haveIncomingCall, setHaveIncomingCall] = useState(
    primaryPhone ? true : false,
  );
  const [shrink, setShrink] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [status, setStatus] = useState('pending');

  const [noteContent, setNoteContent] = useState('');

  let conversationDetail;

  if (conversation) {
    conversationDetail = {
      ...conversation,
      _id: conversation.erxesApiId,
    };
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'accepted') {
      timer = setInterval(() => {
        setTimeSpent((prevTimeSpent) => prevTimeSpent + 1);
      }, 1000);
    }
    if (status !== 'accepted') {
      setHaveIncomingCall(true);
    }

    return () => clearInterval(timer);
  }, [status, primaryPhone]);

  const onTabClick = (tab: string) => {
    setCurrentTab(tab);
    setShrink(true);
  };

  const endCall = () => {
    onDeclineCall();
  };

  const toggleSection = () => {
    toggleSectionWithPhone(primaryPhone);
  };

  const onChangeText = (e) =>
    setNoteContent((e.currentTarget as HTMLInputElement).value);

  const sendMessage = () => {
    setShrink(false);
    addNote(conversationDetail?._id, noteContent);
  };

  const renderFooter = () => {
    if (!shrink) {
      return (
        <InCallFooter>
          <Button btnStyle="link">{__('Add or call')}</Button>
          <CallAction onClick={endCall} isDecline={true}>
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
          <FormControl
            componentClass="textarea"
            placeholder="Send a note..."
            onChange={onChangeText}
          />
          <Button btnStyle="success" onClick={sendMessage}>
            {__('Send')}
          </Button>
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
      </>
    );
  };

  const renderCallerInfo = () => {
    if (!customer) {
      return null;
    }

    if (!shrink) {
      return (
        <>
          {renderFullName(customer || '')}
          <PhoneNumber shrink={shrink}>{primaryPhone}</PhoneNumber>
          <p>{caller.place}</p>
        </>
      );
    }

    return <PhoneNumber shrink={shrink}>{primaryPhone}</PhoneNumber>;
  };

  const onAcceptCall = () => {
    if (!hasMicrophone) {
      return Alert.error('Check your microphone');
    }
    console.log('onAcceptCall');
    setStatus('accepted');
    const { answerCall, call } = context;
    setHaveIncomingCall(false);
    if (answerCall && call?.status !== CALL_STATUS_IDLE) {
      console.log('accepted');
      answerCall();
    }
  };

  const onDeclineCall = () => {
    setHaveIncomingCall(false);
    const { stopCall } = context;

    if (stopCall) {
      stopCall();
    }
  };

  const ignoreCall = () => {
    setHaveIncomingCall(false);
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

  const acceptIncomingTrigger = (
    <CallButton onClick={onAcceptCall}>
      <Icon icon="phone" size={18} />
    </CallButton>
  );

  const content = () => {
    return (
      <IncomingCallNav>
        <IncomingContainer>
          <NameCardContainer>
            <NameCard
              user={{
                ...customer,
                username: customer?.primaryPhone,
                details: {
                  firstName: customer?.firstName || '',
                  lastName: customer?.lastName || '',
                },
              }}
              avatarSize={30}
              secondLine={
                isEnabled('tags') && (
                  <Tags tags={customer?.getTags || []} limit={3} />
                )
              }
            />
          </NameCardContainer>
          <IncomingButtonContainer>
            <IncomingActionButton onClick={onAcceptCall} type="accepted">
              Accept
            </IncomingActionButton>
            <IncomingActionButton onClick={onDeclineCall} type="decline">
              Reject
            </IncomingActionButton>
          </IncomingButtonContainer>
        </IncomingContainer>
      </IncomingCallNav>
    );
  };

  if (haveIncomingCall) {
    return (
      <ModalTrigger
        title="Incoming call"
        trigger={acceptIncomingTrigger}
        content={content}
      />
    );
  }
  if (status === 'accepted' && !haveIncomingCall) {
    return (
      hasMicrophone && (
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
                {shrink && (
                  <CallAction
                    shrink={shrink}
                    isDecline={true}
                    onClick={endCall}
                  >
                    <Icon icon="phone-slash" />
                  </CallAction>
                )}
              </Actions>
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
                    <ActionNumber>1</ActionNumber>
                  </CallTab>
                ))}
              </CallTabsContainer>
            </ContactItem>
            {renderFooter()}
          </InCall>
        </Popover>
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
