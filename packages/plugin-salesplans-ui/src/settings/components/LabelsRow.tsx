import Form from '../containers/LabelsForm';
import Label from '@erxes/ui/src/components/Label';
import React from 'react';
import { ISPLabel } from '../types';
import { FormControl, TextInfo, ModalTrigger } from '@erxes/ui/src/components';

type Props = {
  spLabel: ISPLabel;
  history: any;
  isChecked: boolean;
  toggleBulk: (spLabel: ISPLabel, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  modalContent = props => {
    const { spLabel } = this.props;

    const updatedProps = {
      ...props,
      spLabel
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { spLabel, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(spLabel, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const { _id, title, effect, color, status } = spLabel;

    const trigger = (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{title}</td>
        <td>{effect}</td>

        <td>
          <Label lblColor={color} ignoreTrans={true}>
            {color}
          </Label>
        </td>
        <td>
          <TextInfo>{status}</TextInfo>
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        size={'lg'}
        title="Edit label"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default Row;
