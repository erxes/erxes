import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
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
  CallTabContent
} from '../styles';
import { caller, inCallTabs } from '../constants';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import AssignBox from '@erxes/ui-inbox/src/inbox/containers/AssignBox';
import Tagger from '@erxes/ui-tags/src/containers/Tagger';
import WidgetPopover from './WidgetPopover';
import { isEnabled, renderFullName } from '@erxes/ui/src/utils/core';
import * as PropTypes from 'prop-types';
import { callPropType, sipPropType } from '../lib/types';
import { CALL_STATUS_IDLE } from '../lib/enums';
import { ICustomer } from '../types';
import { Tags } from '@erxes/ui/src/components';

type Props = {
  customer: ICustomer;
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
    useGrouping: false
  });
};

const IncomingCall: React.FC<Props> = (props: Props, context) => {
  const Sip = context;
  const { mute, unmute, isMuted, isHolded, hold, unhold } = Sip;

  const { customer } = props;
  const primaryPhone = customer?.primaryPhone;

  const [currentTab, setCurrentTab] = useState('');
  const [haveIncomingCall, setHaveIncomingCall] = useState(
    primaryPhone ? true : false
  );
  const [shrink, setShrink] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [status, setStatus] = useState('pending');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'accepted') {
      timer = setInterval(() => {
        setTimeSpent(prevTimeSpent => prevTimeSpent + 1);
      }, 1000);
    }

    if (primaryPhone && status !== 'accepted') {
      setHaveIncomingCall(true);
    }

    return () => clearInterval(timer);
  }, [status, primaryPhone]);

  const onTabClick = (tab: string) => {
    setCurrentTab(tab);
    setShrink(true);
  };

  const afterSave = () => {
    onDeclineCall();
    setShowHistory(true);
  };

  const endCall = () => {
    onDeclineCall();
    setShowHistory(true);
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
          <FormControl componentClass="textarea" placeholder="Send a note..." />
          <Button btnStyle="success">{__('Send')}</Button>
        </CallTabContent>
        <CallTabContent tab="Tags" show={currentTab === 'Tags' ? true : false}>
          <Tagger type="" />
        </CallTabContent>
        <CallTabContent
          tab="Assign"
          show={currentTab === 'Assign' ? true : false}
        >
          <AssignBox targets={[]} event="onClick" afterSave={afterSave} />
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
    setStatus('accepted');
    const { answerCall, call } = context;
    setHaveIncomingCall(false);

    if (answerCall && call?.status !== CALL_STATUS_IDLE) {
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

  const popoverNotification = (
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
              <CallAction shrink={shrink} isDecline={true} onClick={endCall}>
                <Icon icon="phone-slash" />
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
                <ActionNumber>1</ActionNumber>
              </CallTab>
            ))}
          </CallTabsContainer>
        </ContactItem>
        {renderFooter()}
      </InCall>
    </Popover>
  );

  if (showHistory) {
    return <WidgetPopover autoOpenTab="History" />;
  }
  if (haveIncomingCall) {
    return (
      <IncomingCallNav>
        <NameCard
          user={{ ...customer, username: customer?.primaryPhone }}
          avatarSize={30}
          secondLine={
            isEnabled('tags') && (
              <Tags tags={customer?.getTags || []} limit={3} />
            )
          }
        />
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom"
          overlay={popoverNotification}
        >
          <CallButton onClick={onAcceptCall}>
            <Icon icon="check" size={13} />
          </CallButton>
        </OverlayTrigger>
        {/* <CallButton type="decline" onClick={onDeclineCall}>
          <Icon icon="cancel" size={13} />
        </CallButton> */}
        <Button size="small" btnStyle="simple" onClick={ignoreCall}>
          Ignore
        </Button>
      </IncomingCallNav>
    );
  }
  if (status === 'accepted' && !haveIncomingCall) {
    return (
      <IncomingCallNav>
        <NameCard
          user={customer}
          avatarSize={30}
          secondLine="Incoming call..."
        />
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom"
          overlay={popoverNotification}
        >
          <CallButton>
            <Icon icon="phone" size={13} />
          </CallButton>
        </OverlayTrigger>
      </IncomingCallNav>
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
  isHolded: PropTypes.func
};
export default IncomingCall;
