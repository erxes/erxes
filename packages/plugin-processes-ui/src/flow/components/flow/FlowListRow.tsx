import { FormControl } from '@erxes/ui/src/components/form';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import React from 'react';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IJobRefer, IFlowDocument } from '../../types';
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

    const renderProducts = products => {
      if (products.length) {
        return products.map(e => (
          <>
            <FormGroup>
              <TextInfo>
                {e.product.name + ' - ' + e.quantity + ' /Qty/'}
              </TextInfo>
            </FormGroup>
          </>
        ));
      } else {
        return '';
      }
    };

    const onTrClick = () => {
      history.push(`/processes/flows/details/${flow._id}`);
    };

    const { name, status, jobs, flowJobStatus } = flow;

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
        <td>{status}</td>
        <td>
          {flowJobStatus === true && renderLabelInfo('success', 'True')}
          {flowJobStatus === false && renderLabelInfo('danger', 'False')}
        </td>
        <td>{jobs.length}</td>
      </tr>
    );
  }
}

export default Row;
