import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
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

type Props = {};

type State = {
  currentTab: string;
  haveIncomingCall: boolean;
  shrink: boolean;
  timeSpent: number;
  status: string;
  showHistory: boolean;
};

class IncomingCall extends React.Component<Props, State> {
  timer: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);

    this.timer = {} as NodeJS.Timeout;

    this.state = {
      currentTab: '',
      haveIncomingCall: true,
      shrink: false,
      timeSpent: 0,
      status: 'pending',
      showHistory: false
    };
  }

  onTabClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  startTimer() {
    this.timer = setInterval(() => {
      this.setState(prevState => ({
        timeSpent: prevState.timeSpent + 1
      }));
    }, 1000);
  }

  afterSave = () => {
    console.log('');
  };

  endCall = () => {
    this.setState({ haveIncomingCall: false, showHistory: true });
  };

  renderFooter = () => {
    const { currentTab, shrink } = this.state;

    if (!shrink) {
      return (
        <InCallFooter>
          <Button btnStyle="link">{__('Add or call')}</Button>
          <CallAction onClick={this.endCall} isDecline={true}>
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
          <AssignBox targets={[]} event="onClick" afterSave={this.afterSave} />
        </CallTabContent>
      </>
    );
  };

  renderCallerInfo = () => {
    const { shrink } = this.state;

    if (!shrink) {
      return (
        <>
          <b>{caller.name}</b>
          <PhoneNumber shrink={shrink}>{caller.phone}</PhoneNumber>
          <p>{caller.place}</p>
        </>
      );
    }

    return <PhoneNumber shrink={shrink}>{caller.phone}</PhoneNumber>;
  };

  render() {
    const {
      currentTab,
      haveIncomingCall,
      shrink,
      timeSpent,
      showHistory
    } = this.state;

    const onTabClick = tab => {
      if (tab === 'Notes') {
        this.onTabClick('Notes');
      }
      if (tab === 'Tags') {
        this.onTabClick('Tags');
      }
      if (tab === 'Assign') {
        this.onTabClick('Assign');
      }
      this.setState({ shrink: true });
    };

    const popoverNotification = (
      <Popover id="call-popover" className="call-popover">
        <InCall>
          <CallInfo shrink={shrink}>
            <p>
              {__('Call duration:')} <b>{getSpentTime(timeSpent)}</b>
            </p>
            <div>{this.renderCallerInfo()}</div>
            <Actions>
              {callActionButtons.map(action => (
                <CallAction key={action.text} shrink={shrink}>
                  <Icon icon={action.icon} />
                  {!shrink && __(action.text)}
                </CallAction>
              ))}
              {shrink && (
                <CallAction
                  shrink={shrink}
                  isDecline={true}
                  onClick={this.endCall}
                >
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
          {this.renderFooter()}
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
            user={all[0]}
            avatarSize={30}
            secondLine="Incoming call..."
          />
          <OverlayTrigger
            trigger="click"
            rootClose={true}
            placement="bottom"
            overlay={popoverNotification}
          >
            <CallButton
              onClick={() => {
                this.setState({ status: 'accepted' });
                this.startTimer();
              }}
            >
              <Icon icon="check" size={13} />
            </CallButton>
          </OverlayTrigger>
          <CallButton type="decline">
            <Icon
              icon="cancel"
              onClick={() => this.setState({ haveIncomingCall: false })}
              size={13}
            />
          </CallButton>
          <Button size="small" btnStyle="simple">
            Ignore
          </Button>
        </IncomingCallNav>
      );
    }

    return null;
  }
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
}

function getSpentTime(seconds: number): React.ReactNode {
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
}

export default IncomingCall;
