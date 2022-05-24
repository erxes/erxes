import { AvatarWrapper } from '@erxes/ui-logs/src/activityLogs/styles';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { InfoWrapper, Links } from '@erxes/ui/src/styles/main';
import { renderFullName } from '@erxes/ui/src/utils';
import CustomerForm from '@erxes/ui/src/customers/containers/CustomerForm';
import { ICustomer } from '@erxes/ui/src/customers/types';
import React from 'react';
import { CustomerState, Name, NameContainer } from '../../styles';

type Props = {
  customer: ICustomer;
  hideForm?: boolean;
  avatarSize?: number;
  nameSize?: number;
  children?: React.ReactNode;
};

class InfoSection extends React.Component<Props> {
  renderLink(value, icon) {
    let link = value;

    if (!value) {
      return null;
    }

    if (!value.includes('http')) {
      link = 'https://'.concat(value);
    }

    return (
      <a target="_blank" href={link} rel="noopener noreferrer">
        <Icon icon={icon} />
      </a>
    );
  }

  renderLinks(links) {
    if (!links) {
      return null;
    }

    return (
      <Links>
        {this.renderLink(links.facebook, 'facebook-official')}
        {this.renderLink(links.linkedIn, 'linkedin')}
        {this.renderLink(links.twitter, 'twitter')}
        {this.renderLink(links.youtube, 'youtube-play')}
        {this.renderLink(links.github, 'github-circled')}
        {this.renderLink(links.website, 'external-link-alt')}
      </Links>
    );
  }

  renderPosition() {
    return <p>{this.props.customer.position}</p>;
  }

  renderEditForm = () => {
    if (this.props.hideForm) {
      return null;
    }

    const customerForm = props => {
      return (
        <CustomerForm {...props} size="lg" customer={this.props.customer} />
      );
    };

    return (
      <ModalTrigger
        title="Edit basic info"
        trigger={<Icon icon="pen-1" />}
        size="lg"
        content={customerForm}
      />
    );
  };

  render() {
    const { customer, avatarSize = 50, children, nameSize } = this.props;
    const { links = {}, isOnline, state } = customer;

    return (
      <InfoWrapper>
        <AvatarWrapper isOnline={isOnline} size={avatarSize}>
          <NameCard.Avatar customer={customer} size={avatarSize} />
          <CustomerState>{state}</CustomerState>
        </AvatarWrapper>

        <NameContainer>
          <Name fontSize={nameSize}>
            {renderFullName(customer)}
            {this.renderEditForm()}
          </Name>
          {this.renderPosition()}
          {this.renderLinks(links)}
        </NameContainer>
        {children}
      </InfoWrapper>
    );
  }
}

export default InfoSection;
