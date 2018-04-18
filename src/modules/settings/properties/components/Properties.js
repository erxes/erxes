import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import {
  ModalTrigger,
  Button,
  DropdownToggle,
  Icon,
  EmptyState
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { PropertyGroupForm, PropertyForm } from '../containers';
import { Sidebar, PropertyRow } from './';
import { PropertyList } from '../styles';

const propTypes = {
  queryParams: PropTypes.object,
  refetch: PropTypes.func,
  fieldsGroups: PropTypes.array,
  currentType: PropTypes.string,
  removePropertyGroup: PropTypes.func.isRequired,
  removeProperty: PropTypes.func.isRequired,
  updatePropertyVisible: PropTypes.func.isRequired,
  updatePropertyGroupVisible: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class Properties extends Component {
  constructor(props) {
    super(props);

    this.renderProperties = this.renderProperties.bind(this);
    this.renderActionBar = this.renderActionBar.bind(this);
  }

  renderProperties() {
    const {
      fieldsGroups,
      queryParams,
      removePropertyGroup,
      removeProperty,
      updatePropertyVisible
    } = this.props;

    if (fieldsGroups.length === 0) {
      return (
        <EmptyState
          icon="circular"
          text="There arent't any groups and fields"
        />
      );
    }

    return (
      <PropertyList>
        {fieldsGroups.map(group => {
          return (
            <PropertyRow
              key={group._id}
              group={group}
              queryParams={queryParams}
              removePropertyGroup={removePropertyGroup}
              removeProperty={removeProperty}
              updatePropertyVisible={updatePropertyVisible}
            />
          );
        })}
      </PropertyList>
    );
  }

  renderActionBar() {
    const { __ } = this.context;
    const { queryParams, fieldsGroups } = this.props;

    let propertyForm = <PropertyForm queryParams={queryParams} />;

    if (fieldsGroups.length === 0) {
      propertyForm = <center>{__('Please add property Group first')}!</center>;
    }

    const addGroup = <MenuItem>{__('Add group')}</MenuItem>;
    const addField = <MenuItem>{__('Add Property')}</MenuItem>;

    return (
      <Dropdown id="dropdown-knowledgebase" className="quick-button" pullRight>
        <DropdownToggle bsRole="toggle">
          <Button btnStyle="success" size="small" icon="add">
            {__('Add Group & Field ')} <Icon icon="downarrow" />
          </Button>
        </DropdownToggle>
        <Dropdown.Menu>
          <ModalTrigger title="Add Group" trigger={addGroup} size="lg">
            <PropertyGroupForm queryParams={queryParams} />
          </ModalTrigger>
          <ModalTrigger title="Add Property" trigger={addField} size="lg">
            {propertyForm}
          </ModalTrigger>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const { __ } = this.context;
    const { currentType } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Properties'), link: '/settings/properties' },
      { title: __(currentType) }
    ];

    return (
      <Wrapper
        actionBar={<Wrapper.ActionBar right={this.renderActionBar()} />}
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar currentType={currentType} />}
        content={this.renderProperties()}
      />
    );
  }
}

Properties.propTypes = propTypes;
Properties.contextTypes = contextTypes;

export default Properties;
