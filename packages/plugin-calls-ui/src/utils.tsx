import React from 'react';
import AssignBox from '@erxes/ui-inbox/src/inbox/containers/AssignBox';
import Tagger from '@erxes/ui-tags/src/containers/Tagger';
import { Button, FormControl, Icon } from '@erxes/ui/src/components';
import { renderFullName, __ } from '@erxes/ui/src/utils';
import Popover from 'react-bootstrap/Popover';
import {
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
} from './styles';

export const formatPhone = phone => {
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

export const callPopover = (
  callerData,
  shrink,
  timeSpent,
  callActionButtons,
  endCall,
  onTabClick,
  inCallTabs,
  currentTab,
  afterSave
) => {
  return (
    <Popover id="call-popover" className="call-popover">
      <InCall>
        <CallInfo shrink={shrink}>
          <p>
            {__('Call duration:')} <b>{getSpentTime(timeSpent)}</b>
          </p>
          <div>{renderCallerInfo(callerData, shrink)}</div>
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
        {renderFooter(shrink, currentTab, endCall, afterSave)}
      </InCall>
    </Popover>
  );
};

const formatNumber = (n: number) => {
  return n.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
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

const renderCallerInfo = (callData, shrink) => {
  if (!callData) {
    return null;
  }

  if (!shrink) {
    return (
      <>
        {renderFullName(callData?.customer || '')}
        <PhoneNumber shrink={shrink}>{callData.callerNumber}</PhoneNumber>
        {/* <p>{caller.place}</p> */}
      </>
    );
  }

  return <PhoneNumber shrink={shrink}>{callData.callerNumber}</PhoneNumber>;
};

const renderFooter = (shrink, currentTab, endCall, afterSave) => {
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
      <CallTabContent tab="Notes" show={currentTab === 'Notes' ? true : false}>
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
