import { AvatarWrapper } from 'modules/activityLogs/styles';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import { renderFullName } from 'modules/common/utils';
import CustomerForm from 'modules/customers/containers/CustomerForm';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { Name } from '../../styles';

type Props = {
  customer: ICustomer;
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
    return (
      <Links>
        {this.renderLink(links.facebook, 'facebook-official')}
        {this.renderLink(links.twitter, 'twitter')}
        {this.renderLink(links.linkedIn, 'linkedin-logo')}
        {this.renderLink(links.youtube, 'youtube-play')}
        {this.renderLink(links.github, 'github-circled')}
        {this.renderLink(links.website, 'link-alt')}
      </Links>
    );
  }

  renderPosition() {
    return <p>{this.props.customer.position}</p>;
  }

  renderStatus(isUser) {
    return <div>{isUser ? 'User' : 'Visitor'}</div>;
  }

  render() {
    const { customer } = this.props;
    const { links = {}, isOnline, isUser } = customer;

    const customerForm = props => {
      return <CustomerForm {...props} size="lg" customer={customer} />;
    };

    return (
      <InfoWrapper>
        <AvatarWrapper isOnline={isOnline}>
          <NameCard.Avatar customer={customer} size={50} />
          {this.renderStatus(isUser)}
        </AvatarWrapper>

        <Name>
          {renderFullName(customer)}
          {this.renderPosition()}
          {this.renderLinks(links)}
        </Name>

        <ModalTrigger
          title="Edit basic info"
          trigger={<Icon icon="edit" />}
          size="lg"
          content={customerForm}
        />
      </InfoWrapper>
    );
  }
}

export default InfoSection;
