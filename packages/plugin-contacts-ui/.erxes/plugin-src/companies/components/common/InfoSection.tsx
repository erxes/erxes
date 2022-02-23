import { AvatarWrapper } from '@erxes/ui/src/activityLogs/styles';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { InfoWrapper, Links } from '@erxes/ui/src/styles/main';
import { Name, NameContainer } from '@erxes/ui-contacts/src/customers/styles';
import React from 'react';
import CompanyForm from '@erxes/ui/src/companies/containers/CompanyForm';
import { ICompany } from '../../types';

type Props = {
  company: ICompany;
  children?: React.ReactNode;
};

class InfoSection extends React.Component<Props> {
  renderLink(value, icon) {
    let link = value;

    if (!value) {
      return null;
    }

    if (!value.includes('http')) {
      link = 'http://'.concat(value);
    }

    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
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
        {this.renderLink(links.facebook, 'facebook')}
        {this.renderLink(links.linkedIn, 'linkedin')}
        {this.renderLink(links.twitter, 'twitter')}
        {this.renderLink(links.youtube, 'youtube-play')}
        {this.renderLink(links.github, 'github-circled')}
        {this.renderLink(links.website, 'external-link-alt')}
      </Links>
    );
  }

  render() {
    const { company, children } = this.props;
    const { links = {} } = company;

    const content = props => <CompanyForm {...props} company={company} />;

    return (
      <InfoWrapper>
        <AvatarWrapper size={60} hideIndicator={true}>
          <NameCard.Avatar company={company} size={60} />
        </AvatarWrapper>

        <NameContainer>
          <Name fontSize={16}>
            {company.primaryName}

            <ModalTrigger
              title="Edit basic info"
              trigger={<Icon icon="pen-1" />}
              size="lg"
              content={content}
            />
          </Name>
          {this.renderLinks(links)}
        </NameContainer>
        {children}
      </InfoWrapper>
    );
  }
}

export default InfoSection;
