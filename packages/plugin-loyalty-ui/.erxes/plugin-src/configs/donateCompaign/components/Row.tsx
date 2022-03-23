import { FormControl, TextInfo, ModalTrigger, Icon } from '@erxes/ui/src/components';
import React from 'react';
import Form from '../containers/Form';
import { IDonateCompaign } from '../types';
import { Link } from 'react-router-dom';

type Props = {
  donateCompaign: IDonateCompaign;
  history: any;
  isChecked: boolean;
  toggleBulk: (donateCompaign: IDonateCompaign, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  modalContent = props => {
    const { donateCompaign } = this.props;

    const updatedProps = {
      ...props,
      donateCompaign
    }

    return (
      <Form {...updatedProps} />
    )
  };

  render() {
    const { donateCompaign, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(donateCompaign, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const {
      _id,
      title,
      startDate,
      endDate,
      finishDateOfUse,
      status,

    } = donateCompaign;

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
        <td>{new Date(startDate).toLocaleDateString()}</td>
        <td>{new Date(endDate).toLocaleDateString()}</td>
        <td>{new Date(finishDateOfUse).toLocaleDateString()}</td>
        <td>
          <TextInfo>{status}</TextInfo>
        </td>
        <td onClick={onClick}>
          <Link to={`/erxes-plugin-loyalty/donates?compaignId=${_id}`}>
            <Icon icon='list-2' />
          </Link>
        </td>
      </tr>
    )

    return (
      <ModalTrigger
        size={'lg'}
        title="Edit donate compaign"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />

    );
  }
}

export default Row;
