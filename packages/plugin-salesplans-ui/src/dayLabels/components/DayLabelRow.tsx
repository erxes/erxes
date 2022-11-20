import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Form from '../containers/EditForm';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import moment from 'moment';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components';
import { IDayLabel } from '../types';

type Props = {
  dayLabel: IDayLabel;
  history: any;
  isChecked: boolean;
  toggleBulk: (dayLabel: IDayLabel, isChecked?: boolean) => void;
  edit: (doc: IDayLabel) => void;
};

type State = {
  labelIds: string[];
};

class Row extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      labelIds: props.dayLabel.labelIds || []
    };
  }

  onChangeValue = e => {
    const { edit, dayLabel } = this.props;
    const value = e.target.value;

    this.setState({ labelIds: value }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        edit({ _id: dayLabel._id, labelIds: value });
      }, 1000);
    });
  };

  modalContent = props => {
    return <Form {...props} dayLabel={this.props.dayLabel} />;
  };

  render() {
    const { dayLabel, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(dayLabel, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <Button id="edit" btnStyle="link">
        <Icon icon="pen-1" />
      </Button>
    );

    const { _id, date, branch, department, labels } = dayLabel;
    return (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{moment(date).format('YYYY/MM/DD')}</td>
        <td>{branch ? `${branch.code} - ${branch.title}` : ''}</td>
        <td>{department ? `${department.code} - ${department.title}` : ''}</td>
        <td>
          {(labels || []).map(l => (
            <span key={Math.random()}>
              <Label lblColor={l.color} children={l.title} />
              &nbsp;
            </span>
          ))}
        </td>
        <td>
          <ActionButtons>
            <Tip text={__('Edit')} placement="bottom">
              <ModalTrigger
                title="Edit label"
                trigger={trigger}
                autoOpenKey="showProductModal"
                content={this.modalContent}
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
