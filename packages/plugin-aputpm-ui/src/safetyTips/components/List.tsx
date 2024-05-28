import { __ } from '@erxes/ui/src/utils/core';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import Row from './Row';
import Form from '../containers/Form';
import { SafetyTip } from '../types';
type Props = {
  list: SafetyTip[];
  totalCount: number;
  remove: (_id: string) => void;
};

class List extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderContent() {
    const { list = [] } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Created At')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <Row key={item._id} item={item} remove={this.props.remove} />
          ))}
        </tbody>
      </Table>
    );
  }

  renderAdd() {
    const trigger = <Button btnStyle="success">{__('Add')}</Button>;

    const content = ({ closeModal }) => <Form closeModal={closeModal} />;

    return (
      <ModalTrigger
        title="Add Safety Tip"
        trigger={trigger}
        content={content}
      />
    );
  }

  render() {
    const { totalCount } = this.props;

    const right = <BarItems>{this.renderAdd()}</BarItems>;

    return (
      <Wrapper
        header={<Wrapper.Header title="Safety Tips" />}
        actionBar={<Wrapper.ActionBar right={right} />}
        content={this.renderContent()}
        footer={<Pagination count={totalCount} />}
      />
    );
  }
}

export default List;
