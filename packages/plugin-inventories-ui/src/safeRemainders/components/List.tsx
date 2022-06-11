import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import { __, router } from '@erxes/ui/src/utils';
import {
  BarItems,
  DataWithLoader,
  EmptyState,
  FormControl,
  Pagination,
  Table,
  Wrapper
} from '@erxes/ui/src';
import { ISafeRemainder } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { menuRemainder } from '../../constants';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import SafeRemainderForm from '../containers/SafeRemainderForm';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  remainders: ISafeRemainder[];
  totalCount: number;
  loading: boolean;
  removeRemainder: (_id: string) => void;
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
        remove={removeRemainder}
      />
    ));
  };

  render() {
    const { loading, queryParams, history, totalCount } = this.props;

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add safe remainder
      </Button>
    );

    const modalContent = props => <SafeRemainderForm {...props} />;

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
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Date')}</th>
              <th>{__('Branch')}</th>
              <th>{__('Department')}</th>
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

    if (totalCount === 0) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Safe Remainders')}
            submenu={menuRemainder}
          />
        }
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
      />
    );
  }
}

export default List;
