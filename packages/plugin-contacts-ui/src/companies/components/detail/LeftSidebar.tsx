import BasicInfoSection from '../common/BasicInfoSection';
import CustomFieldsSection from '../../containers/detail/CustomFieldsSection';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';
import { TrackedDataSection } from '../../../customers/components/common';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  company: ICompany;
  taggerRefetchQueries?: any[];
  fields: IField[];
};

class LeftSidebar extends React.Component<Props> {
  renderTrackedData() {
    const { trackedData = [] } = this.props.company;

    if (trackedData.length === 0) {
      return null;
    }

    return (
      <>
        <TrackedDataSection company={this.props.company} />
      </>
    );
  }

  render() {
    const { company, taggerRefetchQueries, fields } = this.props;

    return (
      <Sidebar wide={true}>
        <BasicInfoSection company={company} fields={fields} />
        <CustomFieldsSection company={company} />
        {this.renderTrackedData()}
        {isEnabled('tags') && (
          <TaggerSection
            data={company}
            type="contacts:company"
            refetchQueries={taggerRefetchQueries}
          />
        )}
      </Sidebar>
    );
  }
}

export default LeftSidebar;
