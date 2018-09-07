import * as React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { TaggerSection } from 'modules/customers/components/common';
import {
  BasicInfo,
  CustomFieldsSection
} from 'modules/companies/containers/detail';

class LeftSidebar extends React.Component {
  render() {
    const { company, taggerRefetchQueries } = this.props;

    return (
      <Sidebar wide>
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

LeftSidebar.propTypes = {
  company: PropTypes.object.isRequired,
  taggerRefetchQueries: PropTypes.array
};

export default LeftSidebar;
