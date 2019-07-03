import {
  BasicInfo,
  CustomFieldsSection
} from 'modules/companies/containers/detail';
import { ICompany } from 'modules/companies/types';
import { TaggerSection } from 'modules/customers/components/common';
import { Sidebar } from 'modules/layout/components';
import React from 'react';

type Props = {
  company: ICompany;
  taggerRefetchQueries?: any[];
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { company, taggerRefetchQueries } = this.props;

    return (
      <Sidebar wide={true}>
        <BasicInfo company={company} />
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
