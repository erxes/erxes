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
import { all, caller, callActionButtons, inCallTabs } from '../constants';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import AssignBox from '@erxes/ui-inbox/src/inbox/containers/AssignBox';
import Tagger from '@erxes/ui-tags/src/containers/Tagger';
import WidgetPopover from './WidgetPopover';
import { renderFullName } from '@erxes/ui/src/utils/core';

type Props = {
  callData?: any;
};

type State = {
  currentTab: string;
  haveIncomingCall: boolean;
  shrink: boolean;
  timeSpent: number;
  status: string;
  showHistory: boolean;
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

const IncomingCall: React.FC<Props> = ({ callData }) => {
  const [currentTab, setCurrentTab] = useState('');
  const [haveIncomingCall, setHaveIncomingCall] = useState(
    callData && callData.callerNumber ? true : false
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

    if (callData && callData.callerNumber) {
      setHaveIncomingCall(true);
    }

    return () => clearInterval(timer);
  }, [status, callData]);

  const onTabClick = (tab: string) => {
    setCurrentTab(tab);
    setShrink(true);
  };

  const afterSave = () => {
    console.log('');
  };

  const endCall = () => {
    setHaveIncomingCall(false);
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
    if (!callData) {
      return null;
    }

    if (!shrink) {
      return (
        <>
          {renderFullName(callData.customer)}
          <PhoneNumber shrink={shrink}>{callData.callerNumber}</PhoneNumber>
          <p>{caller.place}</p>
        </>
      );
    }

    return <PhoneNumber shrink={shrink}>{callData.callerNumber}</PhoneNumber>;
  };

  const onAcceptCall = () => {
    setStatus('accepted');
  };

  const onDeclineCall = () => {
    setHaveIncomingCall(false);
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
            {callActionButtons.map(action => (
              <CallAction key={action.text} shrink={shrink}>
                <Icon icon={action.icon} />
                {!shrink && __(action.text)}
              </CallAction>
            ))}
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
          user={callData.customer}
          avatarSize={30}
          secondLine="Incoming call..."
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
        <CallButton type="decline" onClick={onDeclineCall}>
          <Icon icon="cancel" size={13} />
        </CallButton>
        <Button size="small" btnStyle="simple">
          Ignore
        </Button>
      </IncomingCallNav>
    );
  }

  return null;
};

export default IncomingCall;
