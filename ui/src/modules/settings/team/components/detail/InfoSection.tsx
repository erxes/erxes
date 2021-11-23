import { AvatarWrapper } from 'modules/activityLogs/styles';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import { renderUserFullName } from 'modules/common/utils';
import React from 'react';
import { NameContainer, Name } from 'modules/customers/styles';
import { IUser } from 'modules/auth/types';

type Props = {
  user: IUser;
  renderEditForm: ({
    closeModal,
    user
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
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

  renderEditForm = () => {
    const { hideForm, renderEditForm, user } = this.props;

    if (hideForm) {
      return null;
    }

    const customerForm = props => {
      return renderEditForm({ ...props, user });
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
    const { user, avatarSize = 50, children, nameSize } = this.props;
    const { links = {} } = user;

    return (
      <InfoWrapper>
        <AvatarWrapper size={avatarSize} isOnline={user.isActive}>
          <NameCard.Avatar user={user} size={avatarSize} />
        </AvatarWrapper>

        <NameContainer>
          <Name fontSize={nameSize}>
            {renderUserFullName(user)}
            {this.renderEditForm()}
          </Name>
          {this.renderLinks(links)}
        </NameContainer>
        {children}
      </InfoWrapper>
    );
  }
}

export default InfoSection;
