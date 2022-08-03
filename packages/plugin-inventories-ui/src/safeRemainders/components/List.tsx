import React from 'react';
import {
  __,
  Wrapper,
  BarItems,
  Button,
  Pagination,
  Table,
  DataWithLoader,
  ModalTrigger
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { ISafeRemainder } from '../types';
import { SUBMENU } from '../../constants';
import Form from '../containers/Form';
import Row from './Row';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  remainders: ISafeRemainder[];
  totalCount: number;
  loading: boolean;
  removeRemainder: (remainder: ISafeRemainder) => void;
}

class List extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);
  }

  renderRow = () => {
    const { remainders, history, removeRemainder } = this.props;

    return (remainders || []).map(rem => (
      <Row
        history={history}
        key={rem._id}
        remainder={rem}
        removeRemainder={removeRemainder}
      />
    ));
  };

  render() {
    const { loading, queryParams, history, totalCount } = this.props;

    const trigger = (
      <Button btnStyle="success" icon="plus-circle" size="small">
        Add safe remainder
      </Button>
    );

    const modalContent = props => <Form {...props} history={history} />;

    let actionBarRight = (
      <BarItems>
        <ModalTrigger
          title="Add Product/Services"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
          size="lg"
        />
      </BarItems>
    );

    let content = (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__('Date')}</th>
              <th>{__('Branch')}</th>
              <th>{__('Department')}</th>
              <th>{__('Product Category')}</th>
              <th>{__('Description')}</th>
              <th>{__('Status')}</th>
              <th>{__('ModifiedAt')}</th>
              <th>{__('ModifiedBy')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Safe Remainders')} submenu={SUBMENU} />
        }
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={totalCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
      />
    );
  }
}

export default List;
