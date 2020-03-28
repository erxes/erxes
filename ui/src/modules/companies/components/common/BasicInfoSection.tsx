import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import { ICompany } from '../../types';
import DetailInfo from './DetailInfo';

type Props = {
  company: ICompany;
};

class BasicInfoSection extends React.Component<Props> {
  render() {
    const { Section } = Sidebar;
    const { company } = this.props;

    return (
      <Section>
        <DetailInfo company={company} />
      </Section>
    );
  }
}

export default BasicInfoSection;
