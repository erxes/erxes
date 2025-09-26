import * as PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, __ } from '@erxes/ui/src/utils';
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Icon from '@erxes/ui/src/components/Icon';
import { renderFullName } from '@erxes/ui/src/utils/core';

import {
  CALL_STATUS_ACTIVE,
  CALL_STATUS_IDLE,
  CALL_STATUS_STARTING,
} from '../lib/enums';
import { callPropType, sipPropType } from '../lib/types';
import { ICustomer } from '../types';
import { callActions, endCallOption, renderKeyPad } from '../utils';

import {
  IncomingActionButton,
  IncomingButtonContainer,
  IncomingCallNav,
  IncomingContainer,
  IncomingContent,
  InputBar,
  KeyPadContainer,
  KeyPadFooter,
  MaybeContainer,
  MaybeItem,
  MaybeList,
  NameCardContainer,
  PhoneNumber,
  TagItem,
  TagsContainer,
} from '../styles';

type Props = {
  customer: ICustomer;
  customers: ICustomer[];
  channels: any;
  hasMicrophone: boolean;
  phoneNumber: string;
  hideIncomingCall?: boolean;
  inboxId: string;
  currentCallConversationId: string;
};

const formatNumber = (n: number) =>
  n.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

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

const IncomingCall = (props: Props, context) => {
  const Sip = context;
  const { mute, unmute, isMuted, call } = Sip;
  const {
    customer,
    customers,
    hasMicrophone,
    phoneNumber,
    channels,
    hideIncomingCall,
    currentCallConversationId,
    inboxId,
  } = props;

  const [activeCustomer, setActiveCustomer] = useState<ICustomer | null>(
    customer || null,
  );

  useEffect(() => {
    if (customers && customers.length > 0) {
      const primary =
        customers.find((c) =>
          c.phones?.some(
            (p) => p.phone === phoneNumber && p.type === 'primary',
          ),
        ) || customers[0];
      setActiveCustomer(primary);
    } else if (customer) {
      setActiveCustomer(customer);
    }
  }, [customers, customer, phoneNumber]);

  const primaryPhone = activeCustomer?.primaryPhone || '';
  const navigate = useNavigate();

  const [haveIncomingCall, setHaveIncomingCall] = useState(!!primaryPhone);
  const [showKeyPad, setShowKeyPad] = useState(false);
  const [code, setCode] = useState('0');
  const [dialCode, setDialCode] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [status, setStatus] = useState(
    call?.status === CALL_STATUS_ACTIVE ? 'active' : 'pending',
  );

  let direction = call?.direction?.split('/')[1];
  direction = direction?.toLowerCase() || '';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (audioRef.current) {
      audioRef.current.src = '/sound/incoming.mp3';
      audioRef.current.play();
    }

    if (status === 'accepted') {
      timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      if (call?.status === CALL_STATUS_STARTING) {
        localStorage.removeItem('transferredCallStatus');
      }
      setHaveIncomingCall(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      clearInterval(timer);
    };
  }, [status, primaryPhone]);

  const onAcceptCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    if (!hasMicrophone) return Alert.error('Check your microphone');

    setStatus('accepted');
    setHaveIncomingCall(false);
    if (context.answerCall && call?.status !== CALL_STATUS_IDLE) {
      context.answerCall();
    }
  };

  const onDeclineCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    setHaveIncomingCall(false);
    context.stopCall?.();
  };

  const endCall = () => onDeclineCall();

  const onClickKeyPad = () => setShowKeyPad(!showKeyPad);

  const handleAudioToggle = () => {
    if (!isMuted()) {
      mute();
    } else {
      unmute();
    }
  };

  const handNumPad = (e: string) => {
    let num = code;
    let dialNumber = dialCode;

    if (e === 'delete') {
      num = code.slice(0, -1);
      dialNumber = dialCode.slice(0, -1);
      if (Sip.call?.status === CALL_STATUS_ACTIVE) {
        setDialCode(dialNumber);
        setCode(dialNumber);
      } else {
        setCode(num);
      }
    } else {
      new Audio('/sound/clickNumPad.mp3').play();
      num += e;
      if (Sip.call?.status === CALL_STATUS_ACTIVE) {
        dialNumber += e;
        context.sendDtmf?.(dialNumber);
        setDialCode(dialNumber);
        setCode(dialNumber);
      } else {
        setCode(num);
      }
    }
  };

  const gotoDetail = () => {
    navigate(`/inbox/index?_id=${currentCallConversationId}`, {
      replace: true,
    });
  };

  const renderKeyPadView = () => (
    <KeyPadContainer>
      <InputBar $transparent={true} type="keypad">
        <input
          placeholder={__('0')}
          name="searchValue"
          value={code}
          autoComplete="off"
          type="number"
        />
      </InputBar>
      {renderKeyPad(handNumPad, true)}
      <KeyPadFooter>{endCallOption(endCall, onClickKeyPad)}</KeyPadFooter>
    </KeyPadContainer>
  );

  const renderUserInfo = (type?: string) => {
    const inCall = type === 'incall';
    const hasChannel = channels?.length > 0;
    const channelName = channels?.[0]?.name || '';
    const hasGroupName = call?.groupName || '';

    if (!activeCustomer) {
      return (
        <NameCardContainer>
          <h5>{__('Call')}</h5>
          <Avatar size={inCall ? 72 : 30} />
          <h4>{phoneNumber}</h4>
        </NameCardContainer>
      );
    }

    const otherCustomers =
      customers?.filter((c) => c._id !== activeCustomer._id) || [];

    const fullName = renderFullName(activeCustomer, false);
    const primaryCustomerTags = activeCustomer?.getTags || [];

    return (
      <NameCardContainer>
        <h5>{__('Call')}</h5>
        <Avatar user={activeCustomer} size={inCall ? 72 : 30} />
        <h4>{fullName === 'Unknown' ? phoneNumber : fullName}</h4>

        <PhoneNumber>
          {hasGroupName && (
            <span>
              {__('from')} {hasGroupName}
            </span>
          )}
          {hasChannel && (
            <span>
              {__('is calling to')} {channelName}
            </span>
          )}
        </PhoneNumber>

        {primaryCustomerTags?.length > 0 && inCall && (
          <TagsContainer>
            {primaryCustomerTags.map((tag) => (
              <TagItem key={tag._id}>{tag.name}</TagItem>
            ))}
          </TagsContainer>
        )}

        {!inCall && otherCustomers.length > 0 && (
          <MaybeContainer>
            <b>{__('Maybe')}:</b>
            <MaybeList>
              {otherCustomers.map((c) => (
                <MaybeItem key={c._id}>{renderFullName(c, false)}</MaybeItem>
              ))}
            </MaybeList>
          </MaybeContainer>
        )}
      </NameCardContainer>
    );
  };

  if (haveIncomingCall && !hideIncomingCall) {
    return (
      <>
        <audio ref={audioRef} loop autoPlay />
        <IncomingCallNav>
          <IncomingContainer>
            <IncomingContent>
              {renderUserInfo()}
              <IncomingButtonContainer>
                <div>
                  <IncomingActionButton onClick={onAcceptCall} type="accepted">
                    <Icon icon="phone-alt" size={20} />
                  </IncomingActionButton>
                  <b>{__('Accept')}</b>
                </div>
                <div>
                  <IncomingActionButton onClick={onDeclineCall} type="decline">
                    <Icon icon="phone-slash" size={20} />
                  </IncomingActionButton>
                  <b>{__('Decline')}</b>
                </div>
              </IncomingButtonContainer>
            </IncomingContent>
          </IncomingContainer>
        </IncomingCallNav>
      </>
    );
  }

  if (status === 'accepted' && !haveIncomingCall && !hideIncomingCall) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }

    const renderContent = () =>
      showKeyPad ? (
        renderKeyPadView()
      ) : (
        <>
          {renderUserInfo('incall')}
          <p>
            {__('Call duration:')} <b>{getSpentTime(timeSpent)}</b>
          </p>
          {callActions(
            phoneNumber,
            currentCallConversationId,
            isMuted,
            handleAudioToggle,
            endCall,
            inboxId,
            Sip.call?.status === CALL_STATUS_ACTIVE ? false : true,
            direction,
            gotoDetail,
            !currentCallConversationId,
            onClickKeyPad,
            setActiveCustomer,
          )}
        </>
      );

    return hasMicrophone ? (
      <IncomingCallNav>
        <IncomingContainer>
          <IncomingContent>{renderContent()}</IncomingContent>
        </IncomingContainer>
      </IncomingCallNav>
    ) : (
      <h3>Check your microphone</h3>
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
