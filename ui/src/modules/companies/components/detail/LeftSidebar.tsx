import CustomFieldsSection from 'modules/companies/containers/detail/CustomFieldsSection';
import { ICompany } from 'modules/companies/types';
import TaggerSection from 'modules/customers/components/common/TaggerSection';
import Sidebar from 'modules/layout/components/Sidebar';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import BasicInfoSection from '../common/BasicInfoSection';

type Props = {
  company: ICompany;
  taggerRefetchQueries?: any[];
  fields: IField[];
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { company, taggerRefetchQueries, fields } = this.props;

    return (
      <Sidebar wide={true}>
        <BasicInfoSection company={company} fields={fields} />
        <CustomFieldsSection company={company} />
        <TaggerSection
          data={company}
          type="company"
          refetchQueries={taggerRefetchQueries}
        />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
