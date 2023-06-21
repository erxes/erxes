import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Label from '@erxes/ui/src/components/Label';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Toggle from '@erxes/ui/src/components/Toggle';
import { renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';

import { IAddress } from '@erxes/ui-contacts/src/customers/types';
import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  address: IAddress & { isEditing?: boolean };
  index: number;
  onSelect: (address: IAddress) => void;
  onChangeCheck: (index: number, isChecked: boolean) => void;
};

class Row extends React.Component<Props> {
  renderAction() {
    const { address, onChangeCheck } = this.props;

    const onChange = e => {
      onChangeCheck(this.props.index, e.target.checked);
    };

    const checked = address.isPrimary;

    return (
      <FormControl
        componentClass="checkbox"
        checked={checked}
        onChange={onChange}
      />
    );
  }

  render() {
    const { address } = this.props;

    return (
      <tr
        onClick={() => {
          this.props.onSelect(address);
        }}
      >
        <td>
          {address.isEditing ? (
            <TextInfo textStyle="primary">{address.fullAddress}</TextInfo>
          ) : (
            <TextInfo textStyle="simple">{address.fullAddress}</TextInfo>
          )}
        </td>
        <td>
          <ActionButtons>{this.renderAction()}</ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
