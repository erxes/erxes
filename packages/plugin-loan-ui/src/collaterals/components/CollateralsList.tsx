import {
  __,
  BarItems,
  DataWithLoader,
  FormControl,
  Pagination,
  router,
  SortHandler,
  Table,
  Wrapper
} from '@erxes/ui/src';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import { menuContracts } from '../../constants';
import { CollateralsTableWrapper } from '../styles';
import { ICollateral } from '../types';
import CollateralRow from './CollateralRow';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  collaterals: ICollateral[];
  loading: boolean;
  searchValue: string;
  productIds: string[];
  totalCount: number;
  history: any;
  queryParams: any;
}

type State = {
  searchValue?: string;
  productIds?: string[];
};

class CollateralsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue,
      productIds: this.props.productIds
    };
  }

  onSelectProducts = productIds => {
    const { history } = this.props;

    this.setState({ productIds });
    router.removeParams(history, 'page');
    router.setParams(history, { productIds });
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });
    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      collaterals,
      history,
      loading,
      totalCount,
      queryParams
    } = this.props;

    const mainContent = (
      <CollateralsTableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <SortHandler sortField={'code'} label={__('Code')} />
              </th>
              <th>
                <SortHandler sortField={'name'} label={__('Name')} />
              </th>
              <th>
                <SortHandler
                  sortField={'certificate'}
                  label={__('Certificate №')}
                />
              </th>
              <th>
                <SortHandler sortField={'vinNumber'} label={__('VINNumber')} />
              </th>
              <th>
                <SortHandler sortField={'cost'} label={__('Cost')} />
              </th>
              <th>
                <SortHandler
                  sortField={'marginAmount'}
                  label={__('margin Amount')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'leaseAmount'}
                  label={__('Lease Amount')}
                />
              </th>
            </tr>
          </thead>
          <tbody id="collaterals">
            {collaterals.map(collateral => (
              <CollateralRow
                collateral={collateral}
                key={`${
                  collateral.collateralData
                    ? collateral.collateralData._id
                    : collateral._id
                }`}
                history={history}
              />
            ))}
          </tbody>
        </Table>
      </CollateralsTableWrapper>
    );

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
        <SelectProducts
          label="Filter by products"
          name="productIds"
          queryParams={queryParams}
          onSelect={this.onSelectProducts}
        />
      </BarItems>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Collaterals`) + ` (${totalCount})`}
            queryParams={queryParams}
            submenu={menuContracts}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
            history={history}
          />
        }
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={collaterals.length}
            emptyText="Add in your first collateral!"
            emptyImage="/images/actions/1.svg"
          />
        }
        hasBorder
      />
    );
  }
}

export default withRouter<IRouterProps>(CollateralsList);
