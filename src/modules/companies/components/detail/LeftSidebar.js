import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { Button } from 'modules/common/components';
import { ManageGroups } from 'modules/settings/properties/components';
import { TaggerSection } from 'modules/customers/components/detail/sidebar';
import BasicInfo from './BasicInfo';

const propTypes = {
  company: PropTypes.object.isRequired,
  fieldsGroups: PropTypes.array.isRequired,
  customFieldsData: PropTypes.object
};

class LeftSidebar extends ManageGroups {
  renderSidebarFooter() {
    if (!this.state.editing) {
      return null;
    }

    return (
      <Sidebar.Footer>
        <Button
          btnStyle="simple"
          size="small"
          onClick={this.cancelEditing}
          icon="close"
        >
          Discard
        </Button>
        <Button
          btnStyle="success"
          size="small"
          onClick={this.save}
          icon="checkmark"
        >
          Save
        </Button>
      </Sidebar.Footer>
    );
  }

  render() {
    const { company } = this.props;

    return (
      <Sidebar wide footer={this.renderSidebarFooter()}>
        <BasicInfo company={company} />
        {this.renderGroups(company)}
        <TaggerSection data={company} type="company" />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;
LeftSidebar.contextTypes = {
  __: PropTypes.func
};

export default LeftSidebar;
