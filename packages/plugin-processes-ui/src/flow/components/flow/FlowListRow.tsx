import { FormControl } from '@erxes/ui/src/components/form';
// import TextInfo from '@erxes/ui/src/components/TextInfo';
import React from 'react';
// import FormGroup from '@erxes/ui/src/components/form/Group';
import { IFlowDocument } from '../../types';
import Label from '@erxes/ui/src/components/Label';

type Props = {
  flow: IFlowDocument;
  history: any;
  isChecked: boolean;
  toggleBulk: (flow: IFlowDocument, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { flow, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(flow, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const renderLabelInfo = (style, text) => {
      return <Label lblStyle={style}>{text}</Label>;
    };

    const onTrClick = () => {
      history.push(`/processes/flows/details/${flow._id}`);
    };

    const { name, status, jobCount, flowValidation, product } = flow;

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
        <td>{(product && `${product.code} - ${product.name}`) || ''}</td>
        <td>{status}</td>
        <td>
          {flowValidation === '' && renderLabelInfo('success', 'True')}
          {flowValidation && renderLabelInfo('danger', flowValidation)}
        </td>
        <td>{jobCount || 0}</td>
      </tr>
    );
  }
}

export default Row;
