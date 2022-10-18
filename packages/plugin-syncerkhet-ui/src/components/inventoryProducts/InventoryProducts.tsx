import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import Table from '@erxes/ui/src/components/table';
import Button from '@erxes/ui/src/components/Button';
import Row from './InventoryProductsRow';
import { CollapseContent, DataWithLoader } from '@erxes/ui/src/components';

type Props = {
  loading: boolean;
  history: any;
  queryParams: any;
  toCheckProducts: () => void;
  toSyncProducts: (action: string, products: any[]) => void;
  items: any;
};

type State = {};

export const menuPos = [
  { title: 'Check deals', link: '/check-synced-deals' },
  { title: 'Check orders', link: '/check-pos-orders' },
  { title: 'Check Category', link: '/inventory-category' },
  { title: 'Check Products', link: '/inventory-products' }
];

class InventoryProducts extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  renderRow = (data: any) => {
    if (data.length > 20) {
      data = data.slice(0, 20);
    }
    return data.map(p => <Row history={history} key={p.code} product={p} />);
  };

  renderTable = (data: any, action: string) => {
    const data_len = data.length;

    if (data_len > 20) {
      data = data.slice(0, 20);
    }

    const onClickSync = () => {
      this.props.toSyncProducts(action, data);
    };
    const syncButton = (
      <>
        <Button
          btnStyle="primary"
          size="small"
          icon="check-1"
          onClick={onClickSync}
        >
          Sync
        </Button>
      </>
    );

    const header = (
      <Wrapper.ActionBar
        left={
          data_len > 20 ? (
            <>20 of {data_len} </>
          ) : (
            <>
              {data_len} of {data_len}
            </>
          )
        }
        right={syncButton}
      />
    );
    return (
      <>
        {header}
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Code')}</th>
              <th>{__('Name')}</th>
              <th>{__('Barcode')}</th>
              <th>{__('Unit price')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow(data)}</tbody>
        </Table>
      </>
    );
  };

  render() {
    const { items, toCheckProducts } = this.props;

    const onClickCheck = () => {
      toCheckProducts();
    };

    const checkButton = (
      <>
        <Button
          btnStyle="warning"
          size="small"
          icon="check-1"
          onClick={onClickCheck}
        >
          Check
        </Button>
      </>
    );

    const header = <Wrapper.ActionBar right={checkButton} />;

    const content = (
      <>
        {header}
        <br />
        <CollapseContent
          title={__(
            'Create products' + (items.create ? ':  ' + items.create.count : '')
          )}
        >
          <DataWithLoader
            data={
              items.create
                ? this.renderTable(items.create?.items, 'CREATE')
                : []
            }
            loading={false}
            count={3}
            emptyText={'Please check first.'}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
        </CollapseContent>
        <CollapseContent
          title={__(
            'Update products' + (items.update ? ':  ' + items.update.count : '')
          )}
        >
          <DataWithLoader
            data={
              items.update ? this.renderTable(items.update.items, 'UPDATE') : []
            }
            loading={false}
            emptyText={'Please check first.'}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
        </CollapseContent>
        <CollapseContent
          title={__(
            'Delete products' + (items.delete ? ':  ' + items.delete.count : '')
          )}
        >
          <DataWithLoader
            data={
              items.delete ? this.renderTable(items.delete.items, 'DELETE') : []
            }
            loading={false}
            emptyText={'Please check first.'}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
        </CollapseContent>
      </>
    );
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Check product`)}
            queryParams={this.props.queryParams}
            submenu={menuPos}
          />
        }
        content={<DataWithLoader data={content} loading={this.props.loading} />}
        hasBorder
      />
    );
  }
}

export default InventoryProducts;
