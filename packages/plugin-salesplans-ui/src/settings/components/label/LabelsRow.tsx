import Form from '../../containers/label/LabelsForm';
import Label from '@erxes/ui/src/components/Label';
import React from 'react';
import { ISPLabel } from '../../types';
import { FormControl, TextInfo, ModalTrigger } from '@erxes/ui/src/components';

type Props = {
  spLabel: ISPLabel;
  history: any;
  isChecked: boolean;
  toggleBulk: (spLabel: ISPLabel, isChecked?: boolean) => void;
};

const Row = (props: Props) => {
  const { spLabel, toggleBulk, isChecked } = props;
  const { _id, title, effect, color, status } = spLabel;

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(spLabel, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const modalContent = (formProps) => {
    const updatedProps = {
      ...formProps,
      spLabel,
    };

    return <Form {...updatedProps} />;
  };

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
      title="Edit label"
      trigger={trigger}
      autoOpenKey="showProductModal"
      content={modalContent}
    />
  );
};

export default Row;
