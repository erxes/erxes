import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { Count, Title } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import Form from '../../containers/entries/Form';
import Row from './Row';
import ContentTypesList from '../../containers/entries/ContentTypeList';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  // remove: (doc: { productIds: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: any[], containerId: string) => void;
  loading: boolean;
  entries: any[];
  contentType: any;
}

type State = {
  searchValue?: string;
};

class List extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderRow = () => {
    const { entries, history, toggleBulk, bulk } = this.props;

    return entries.map(entry => (
      <Row
        history={history}
        key={entry._id}
        entry={entry}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(entry)}
      />
    ));
  };

  // onChange = () => {
  //   const { toggleAll, products } = this.props;
  //   toggleAll(products, 'products');
  // };

  // removeProducts = products => {
  //   const productIds: string[] = [];

  //   products.forEach(product => {
  //     productIds.push(product._id);
  //   });

  //   this.props.remove({ productIds }, this.props.emptyBulk);
  // };

  // renderCount = productCount => {
  //   return (
  //     <Count>
  //       {productCount} product{productCount > 1 && 's'}
  //     </Count>
  //   );
  // };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    const {
      loading,
      queryParams,
      isAllSelected,
      history,
      bulk,
      emptyBulk,
      contentType,
      entries
    } = this.props;

    const breadcrumb = [{ title: __('Webbuilder entries') }];

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add items
      </Button>
    );

    const modalContent = props => (
      <Form {...props} contentType={contentType} queryParams={queryParams} />
    );

    const actionBarRight = (
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
              <th style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={() => console.log('onchange')}
                />
              </th>
              <th>{__('id')}</th>
              <th>{__('Content')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    if (entries.length === 0) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Entries"
          size="small"
        />
      );
    }

    const actionBarLeft = (
      <Title>{contentType.displayName || 'All Content types'}</Title>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Webbuilder Entries')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/30.svg"
            title={'Webbuilder entries'}
            description={`${__(
              'All information and know-how related to your business products and services are found here'
            )}.${__(
              'Create and add in unlimited products and servicess so that you and your team members can edit and share'
            )}`}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={actionBarLeft}
            right={actionBarRight}
            withMargin={true}
            wide={true}
            background="colorWhite"
          />
        }
        leftSidebar={
          <ContentTypesList queryParams={queryParams} history={history} />
        }
        // footer={<Pagination count={productsCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            // count={productsCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        hasBorder={true}
        transparent={true}
        noPadding={true}
      />
    );
  }
}

export default List;
