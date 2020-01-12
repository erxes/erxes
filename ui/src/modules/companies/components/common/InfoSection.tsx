import { AvatarWrapper } from 'modules/activityLogs/styles';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import { Name } from 'modules/customers/styles';
import React from 'react';
import CompanyForm from '../../containers/CompanyForm';
import { ICompany } from '../../types';

type Props = {
  company: ICompany;
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
    return (
      <Links>
        {this.renderLink(links.facebook, 'facebook')}
        {this.renderLink(links.twitter, 'twitter')}
        {this.renderLink(links.linkedIn, 'linkedin-logo')}
        {this.renderLink(links.youtube, 'youtube-play')}
        {this.renderLink(links.github, 'github-circled')}
        {this.renderLink(links.website, 'link-alt')}
      </Links>
    );
  }

  render() {
    const { company } = this.props;
    const { links = {} } = company;

    const content = props => <CompanyForm {...props} company={company} />;

    return (
      <InfoWrapper>
        <AvatarWrapper>
          <NameCard.Avatar company={company} size={50} />
        </AvatarWrapper>

        <Name>
          {company.primaryName}
          {this.renderLinks(links)}
        </Name>

        <ModalTrigger
          title="Edit basic info"
          trigger={<Icon icon="edit" />}
          size="lg"
          content={content}
        />
      </InfoWrapper>
    );
  }
}

export default InfoSection;
