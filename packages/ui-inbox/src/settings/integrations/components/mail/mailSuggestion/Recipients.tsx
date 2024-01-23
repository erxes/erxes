import React, { useState } from 'react';
import styled from 'styled-components';
import Dropdown from 'react-bootstrap/Dropdown';
import { Actions } from '@erxes/ui/src/styles/main';
import SmsForm from '@erxes/ui-inbox/src/settings/integrations/containers/telnyx/SmsForm';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { Link } from 'react-router-dom';
import styledTS from 'styled-components-ts';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

const RecipientsDetailBox = styledTS<{
  left?: number;
  top?: number;
}>(styled.div)`
  position:absolute;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3),
    0 2px 6px 2px rgba(60, 64, 67, 0.15);
  z-index: -1000;
  outline: 1px solid transparent;
  outline-offset: -1px;
  min-width: 340px;
  max-width: 488px;
  // top: ${props => props.top && `${props.top + 15}px`};
  // left: ${props => props.left && `${props.left + 15}px`};
  top : 30px;
  left : 0;
  padding: 10px 20px;
  opacity: 0;
  transition-delay: 0.50s;
`;

const Recipient = styled.div`
  position: relative;
  padding: 1px 8px 1px 4px;
  border-radius: 0.75rem;
  color: #fff;
  background-color: #6569df;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    ${RecipientsDetailBox} {
      z-index: 1;
      opacity: 1;
      transition-delay: 0.5s;
    }
  }
`;

const DetailSection = styled.div`
  display: flex;
  align-items: flex-start;
  ul {
    padding: 0 0 0 10px;
    margin: unset;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    min-height: 64px;
    max-width: 200px;
    overflow: hidden;
  }
  span {
    color: rgb(32, 33, 36);
    font-family: 'Google Sans', Roboto, sans-serif;
    font-size: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: capitalize;
  }
  a {
    color: rgb(60, 64, 67);
    font: 400 13px/20px Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    /* &:hover {
      color: rgb(26, 115, 232);
      outline: 2px solid transparent;
      outline-offset: -1px;
      text-decoration: underline;
      cursor: pointer;
      transition: 0.3s ease;
    } */
  }
`;

const DetailActions = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: 0;
  width: 100%;
  white-space: nowrap;
  ${Actions} {
    padding: 0;
  }
`;

type Props = {
  collection: any;
  onRemove: (index: number) => void;
};

type State = {};

class Recipients extends React.Component<Props, State> {
  state = {};

  renderActions = (contact: any) => {
    const { primaryPhone } = contact;

    const smsForm = props => <SmsForm {...props} primaryPhone={primaryPhone} />;

    return (
      <>
        <ModalTrigger
          dialogClassName="middle"
          title={`Send SMS to (${primaryPhone})`}
          trigger={
            <Button
              disabled={primaryPhone ? false : true}
              size="small"
              btnStyle={primaryPhone ? 'primary' : 'simple'}
            >
              <Tip text="Send SMS" placement="top-end">
                <Icon icon="message" />
              </Tip>
            </Button>
          }
          content={smsForm}
        />
        <Button
          href={primaryPhone && `tel:${primaryPhone}`}
          size="small"
          btnStyle={primaryPhone ? 'primary' : 'simple'}
          disabled={primaryPhone ? false : true}
        >
          <Tip text="Call" placement="top-end">
            <Icon icon="phone" />
          </Tip>
        </Button>
      </>
    );
  };

  renderContactDetailBox = (contact: any) => {
    const { fullName, primaryEmail, _id } = contact;
    return (
      <RecipientsDetailBox>
        <DetailSection>
          <NameCard.Avatar customer={contact} size={62} />
          <ul>
            <span>
              {!fullName || fullName === '  ' ? primaryEmail : fullName}
            </span>
            <a>{primaryEmail}</a>
          </ul>
        </DetailSection>
        <Dropdown.Divider />
        <DetailActions>
          <Link to={`/contacts/details/${_id}`}>
            <Button
              size="small"
              btnStyle={_id ? 'primary' : 'simple'}
              disabled={_id ? false : true}
            >
              Open Detailed View
            </Button>
          </Link>
          <Actions>{this.renderActions(contact)}</Actions>
        </DetailActions>
      </RecipientsDetailBox>
    );
  };

  renderRecipients = (contact: any, index: number) => {
    const { fullName, primaryEmail } = contact;

    const content = (
      <Popover id="User Detail">
        <div
          style={{ backgroundColor: 'blue', height: '100px', width: '100px' }}
        >
          content
        </div>
      </Popover>
    );

    return (
      <Recipient>
        <NameCard.Avatar customer={contact} size={17} />
        <span>{!fullName || fullName === '  ' ? primaryEmail : fullName}</span>
        <Icon
          icon="times-circle"
          onClick={e => {
            e.preventDefault();
            this.props.onRemove(index);
          }}
        />
        {this.renderContactDetailBox(contact)}
      </Recipient>
    );
  };

  render() {
    const { collection } = this.props;

    if (collection.length === 0) {
      return null;
    }

    return (
      <>
        {collection.map((contact, index) =>
          this.renderRecipients(contact, index)
        )}
      </>
    );
  }
}

export default Recipients;
