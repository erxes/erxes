import BasicInfo from 'modules/companies/containers/detail/BasicInfo';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import { ICompany } from '../../types';
import DetailInfo from './DetailInfo';
import InfoSection from './InfoSection';

type Props = {
  company: ICompany;
};

class BasicInfoSection extends React.Component<Props> {
  render() {
    const { Section } = Sidebar;
    const { company } = this.props;

    return (
      <Section>
        <InfoSection company={company} />
        <BasicInfo company={company} />
        <DetailInfo company={company} />
      </Section>
    );
  }
}

export default BasicInfoSection;
