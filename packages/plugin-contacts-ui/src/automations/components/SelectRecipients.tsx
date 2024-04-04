import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { ControlLabel, EmptyState, FormGroup, __ } from '@erxes/ui/src';
import React from 'react';
type Props = {
  type: string;
  value: string | string[];
  label: string;
  name: string;
  onSelect: (value: string | string[], name: string) => void;
};

const Components = {
  lead: SelectCustomers,
  customer: SelectCustomers,
  company: SelectCompanies
};

class SelectRecipients extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { type, value, label, name, onSelect } = this.props;

    const Component = Components[type];

    if (!Component) {
      return <EmptyState text="Empty" icon="info-circle" />;
    }

    return (
      <FormGroup>
        <ControlLabel>{__(label)}</ControlLabel>
        <Component
          name={name}
          initialValue={value}
          label={label}
          onSelect={onSelect}
          filterParams={{
            type,
            emailValidationStatus: 'valid'
          }}
        />
      </FormGroup>
    );
  }
}

export default SelectRecipients;
