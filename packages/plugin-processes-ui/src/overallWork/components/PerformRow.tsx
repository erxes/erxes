import _ from 'lodash';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Form from '../../performs/containers/Form';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import moment from 'moment';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { confirm } from '@erxes/ui/src/utils';
import { __ } from 'coreui/utils';
import { FinanceAmount } from '../../styles';
import { IOverallWorkDet } from '../types';
import { IPerform } from '../../performs/types';

type Props = {
  overallWork: IOverallWorkDet;
  perform: IPerform;
  history: any;
  queryParams: any;
  removePerform: (_id: string) => void;
  minPotentialCount: number;
};

class PerformRow extends React.Component<Props> {
  displayLocInfo(obj) {
    if (!obj) {
      return '';
    }
    return `${obj.code} - ${obj.title}`;
  }

  displayWithNameInfo(obj) {
    if (!obj) {
      return '';
    }
    return `${obj.code} - ${obj.name}`;
  }
  displayValue(work, name) {
    const value = _.get(work, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  }

  remove = () => {
    const { removePerform, perform } = this.props;

    confirm(__('Remove this performance?')).then(() => {
      removePerform(perform._id || '');
    });
  };

  displayDate = (date?: Date) => {
    if (!date) {
      return '';
    }

    return moment(date).format('YYYY/MM/DD HH:mm');
  };

  displayUser = () => {
    const { modifiedUser, createdUser } = this.props.perform;
    let user = createdUser;

    if (modifiedUser && modifiedUser !== null) {
      user = modifiedUser;
    }

    if (!user) {
      return '';
    }

    return `${(user.details
      ? `${user.details.fullName || user.details.shortName || ''}`
      : user.username) || user.email}`;
  };

  render() {
    const { perform, minPotentialCount } = this.props;
    const onTrClick = () => {};

    const onClick = e => {
      e.stopPropagation();
    };

    const content = props => (
      <Form
        {...props}
        perform={perform}
        overallWorkDetail={this.props.overallWork}
        max={minPotentialCount}
      />
    );

    return (
      <tr onClick={onTrClick} key={Math.random()}>
        <td>{this.displayDate(perform.startAt)}</td>
        <td>{perform.count}</td>
        <td>{this.displayDate(perform.endAt)}</td>
        <td>{this.displayUser()}</td>
        <td>{this.displayDate(perform.modifiedAt || perform.createdAt)}</td>
        <td>{perform.status}</td>
        <td key={'actions'} onClick={onClick}>
          <ActionButtons>
            <ModalTrigger
              title={__(`Edit perform`)}
              trigger={
                <Button btnStyle="link">
                  <Tip text={__('Edit')} placement="bottom">
                    <Icon icon="edit" />
                  </Tip>
                </Button>
              }
              size="xl"
              content={content}
            />
            <Button btnStyle="link" onClick={this.remove}>
              <Tip text={__('Delete')} placement="bottom">
                <Icon icon="trash-alt" />
              </Tip>
            </Button>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default PerformRow;
