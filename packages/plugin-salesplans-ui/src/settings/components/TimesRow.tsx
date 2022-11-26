import Form from '../containers/TimesEditForm';
import React from 'react';
import { ITimeProportion } from '../types';
import { FormControl, TextInfo, ModalTrigger } from '@erxes/ui/src/components';

type Props = {
  timeProportion: ITimeProportion;
  history: any;
  isChecked: boolean;
  toggleBulk: (timeProportion: ITimeProportion, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  modalContent = props => {
    const { timeProportion } = this.props;

    const updatedProps = {
      ...props,
      timeProportion
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { timeProportion, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(timeProportion, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const {
      _id,
      department,
      branch,
      productCategory,
      percents
    } = timeProportion;

    const trigger = (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{branch ? `${branch.code} - ${branch.title}` : ''}</td>
        <td>{department ? `${department.code} - ${department.title}` : ''}</td>
        <td>
          {productCategory
            ? `${productCategory.code} - ${productCategory.name}`
            : ''}
        </td>
        <td>{(percents || []).map(p => `${p.percent},`)}</td>
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
