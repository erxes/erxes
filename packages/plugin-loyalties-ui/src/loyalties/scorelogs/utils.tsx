import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { __ } from '@erxes/ui/src/utils/core';

import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import Select from 'react-select-plus';
import SelectClientPortalUser from '../../common/SelectClientPortalUsers';
import { getOwnerTypes } from '../common/constants';
import { ClearBtnContainer } from '../../styles';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';

const OwnerComponents = {
  customer: {
    pluginName: 'contacts',
    label: 'Customer',
    component: SelectCustomers
  },
  user: {
    pluginName: 'core',
    label: 'Team Member',
    component: SelectTeamMembers
  },
  company: {
    pluginName: 'contacts',
    label: 'Compnay',
    component: SelectCompanies
  },
  cpUser: {
    pluginName: 'clientportal',
    label: 'Client Portal User',
    component: SelectClientPortalUser
  }
};

type Props = {
  obj: { ownerId: string; ownerType: string };
  onChange: (value, name) => void;
  isClearable?: boolean;
  onClickClear?: (name: string) => void;
};

export function SelectOwner({
  obj,
  onChange,
  isClearable,
  onClickClear
}: Props) {
  const { ownerId, ownerType = 'customer' } = obj || {};

  const handleChange = (value, name) => {
    onChange(value, name);
  };

  const renderOwner = () => {
    const commonProps = {
      name: 'ownerId',
      multi: false,
      initialValue: ownerId,
      onSelect: handleChange
    };

    const { pluginName, label, component } = OwnerComponents[ownerType] || {};
    let Component = component;

    if (isEnabled(pluginName) && !!Component) {
      return <Component {...commonProps} label={label} />;
    }

    return null;
  };

  const renderClearAction = name => {
    if (!isClearable) {
      return null;
    }

    if (obj[name] && onClickClear) {
      const handleClear = () => {
        onClickClear(name);
      };

      return (
        <ClearBtnContainer tabIndex={0} onClick={handleClear}>
          <Tip text={'Clear filter'} placement="bottom">
            <Icon icon="cancel-1" />
          </Tip>
        </ClearBtnContainer>
      );
    }
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>
          {__('Owner type')} {renderClearAction('ownerType')}
        </ControlLabel>
        <Select
          placeholder={__('Select Type')}
          value={ownerType}
          options={getOwnerTypes()}
          multi={false}
          onChange={({ value }) => handleChange(value, 'ownerType')}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>
          {__('Owner')} {renderClearAction('ownerId')}
        </ControlLabel>
        {renderOwner()}
      </FormGroup>
    </>
  );
}
