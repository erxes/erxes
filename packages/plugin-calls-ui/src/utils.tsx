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
  CallTabContent,
  Keypad
} from './styles';
import { numbers, symbols } from './constants';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';

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

// const renderFooter = (shrink, currentTab, endCall, afterSave) => {
//   if (!shrink) {
//     return (
//       <InCallFooter>
//         <Button btnStyle="link">{__('Add or call')}</Button>
//         <CallAction onClick={endCall} isDecline={true}>
//           <Icon icon="phone-slash" />
//         </CallAction>
//         <Button btnStyle="link">{__('Transfer call')}</Button>
//       </InCallFooter>
//     );
//   }

//   return (
//     <>
//       <CallTabContent tab="Notes" show={currentTab === 'Notes' ? true : false}>
//         <FormControl componentClass="textarea" placeholder="Send a note..." />
//         <Button btnStyle="success">{__('Send')}</Button>
//       </CallTabContent>
//       <CallTabContent tab="Tags" show={currentTab === 'Tags' ? true : false}>
//         <Tagger type="" />
//       </CallTabContent>
//       <CallTabContent
//         tab="Assign"
//         show={currentTab === 'Assign' ? true : false}
//       >
//         <AssignBox targets={[]} event="onClick" afterSave={afterSave} />
//       </CallTabContent>
//     </>
//   );
// };

export const renderKeyPad = handNumPad => {
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

export const renderFooter = (
  shrink,
  endCall,
  currentTab,
  onChangeText,
  sendMessage,
  customer,
  taggerRefetchQueries,
  toggleSection,
  conversationDetail,
  handNumPad,
  isKeyPad
) => {
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
      <CallTabContent
        tab="Keypad"
        show={currentTab === 'Keypad' ? true : false}
      >
        {renderKeyPad(handNumPad)}
      </CallTabContent>
      {isKeyPad && (
        <CallAction onClick={endCall} isDecline={true}>
          <Icon icon="phone-slash" />
        </CallAction>
      )}
    </>
  );
};

export const callActions = (
  isMuted,
  handleAudioToggle,
  isHolded,
  handleHold
) => {
  return (
    <Actions>
      {!isMuted() && (
        <CallAction key={'Mute'} shrink={false} onClick={handleAudioToggle}>
          <Icon icon={'phone-times'} />
          {__('Mute')}
        </CallAction>
      )}
      {isMuted() && (
        <CallAction key={'UnMute'} shrink={true} onClick={handleAudioToggle}>
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
  );
};
