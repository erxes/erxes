import { FormControl } from '@erxes/ui/src/components/form';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import React from 'react';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IJobRefer } from '../../types';

type Props = {
  jobRefer: IJobRefer;
  history: any;
  isChecked: boolean;
  toggleBulk: (jobRefer: IJobRefer, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { jobRefer, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(jobRefer, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      history.push(`/processes/flows/details/${jobRefer._id}`);
    };

    const { code, name, type, needProducts, resultProducts } = jobRefer;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{name}</td>
        <td>{code}</td>
        <td>
          <TextInfo>{type}</TextInfo>
        </td>
        <td>{needProducts.length}</td>
        <td>{resultProducts.length}</td>
      </tr>
    );
  }
}

export default Row;
