import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { ICompany } from '../../types';
import DetailInfo from '@erxes/ui-contacts/src/companies/components/common/DetailInfo';

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
