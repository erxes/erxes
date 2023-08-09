import React from 'react';
import moment from 'moment';
import { confirm } from '@erxes/ui/src/utils';
import { __ } from 'coreui/utils';
import { IPerform } from '../types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import Form from '../containers/Form';

type Props = {
  perform: IPerform;
  history: any;
  removePerform: (_id: string) => void;
};

class Row extends React.Component<Props> {
  displayDate = (date?: Date) => {
    if (!date) {
      return '';
    }

    return moment(date).format('YYYY/MM/DD HH:mm');
  };

  displayLoc = obj => {
    if (!obj) {
      return '';
    }

    return `${obj.code} - ${obj.title}`;
  };

  remove = () => {
    const { removePerform, perform } = this.props;

    confirm(__('Remove this performance?')).then(() => {
      removePerform(perform._id || '');
    });
  };

  render() {
    const { perform } = this.props;

    const {
      overallWorkId,
      type,
      status,
      startAt,
      endAt,
      count,
      inProductsLen,
      outProductsLen,
      inBranch,
      inDepartment,
      outBranch,
      outDepartment,
      description
    } = perform;

    const onTrClick = () => {};

    const onClick = e => {
      e.stopPropagation();
    };

    const content = props => <Form {...props} perform={perform} />;

    return (
      <tr onClick={onTrClick} key={Math.random()}>
        <td>{(!!overallWorkId).toString()}</td>
        <td>{type}</td>
        <td>{this.displayDate(startAt)}</td>
        <td>{this.displayDate(endAt)}</td>
        <td>{count}</td>
        <td>{description}</td>
        <td>{inProductsLen}</td>
        <td>{outProductsLen}</td>
        <td>{this.displayLoc(inBranch)}</td>
        <td>{this.displayLoc(inDepartment)}</td>
        <td>{this.displayLoc(outBranch)}</td>
        <td>{this.displayLoc(outDepartment)}</td>

        <td>{status}</td>
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

export default Row;
