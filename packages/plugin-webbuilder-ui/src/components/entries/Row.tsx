import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { FormControl } from '@erxes/ui/src/components/form';
import React from 'react';

type Props = {
  entry: any;
  history: any;
  isChecked: boolean;
  toggleBulk: (product: any, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { entry, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(entry, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      history.push(`/settings/product-service/details/${entry._id}`);
    };

    const { contentTypeId } = entry;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{contentTypeId}</td>
        <td>{''}</td>
        <td>
          <ActionButtons></ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
