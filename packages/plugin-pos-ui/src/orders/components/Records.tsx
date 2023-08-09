import {
  __,
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  BarItems,
  Button
} from '@erxes/ui/src';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuPos } from '../../constants';
import { Link } from 'react-router-dom';
import { TableWrapper } from '../../styles';
import { IOrder } from '../types';
import HeaderDescription from './MainHead';
import RightMenu from './RightMenu';
import Record from './Record';

interface IProps extends IRouterProps {
  orders: IOrder[];
  loading: boolean;
  bulk: any[];
  isAllSelected: boolean;
  history: any;
  queryParams: any;

  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
}

class Orders extends React.Component<IProps, {}> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);
  }

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      orders,
      history,
      loading,
      queryParams,
      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter
    } = this.props;

    const rightMenuProps = {
      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      queryParams
    };

    const actionBarRight = (
      <BarItems>
        <Link to="/settings/exportHistories?type=pos:pos">
          <Button icon="export" btnStyle="success">
            {__(`Export`)}
          </Button>
        </Link>
        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    const header = (
      <HeaderDescription
        icon="/images/actions/26.svg"
        title=""
        summary={{}}
        staticKeys={[]}
        actionBar={actionBarRight}
      />
    );

    const mainContent = (
      <TableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <SortHandler
                  sortField={'created_date'}
                  label={__('created date')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'created_time'}
                  label={__('created time')}
                />
              </th>
              <th>
                <SortHandler sortField={'number'} label={__('Number')} />
              </th>
              <th>
                <SortHandler sortField={'pos'} label={__('POS')} />
              </th>
              <th>
                <SortHandler sortField={'branch'} label={__('Branch')} />
              </th>
              <th>
                <SortHandler
                  sortField={'department'}
                  label={__('Department')}
                />
              </th>
              <th>
                <SortHandler sortField={'cashier'} label={__('Cashier')} />
              </th>
              <th>
                <SortHandler sortField={'type'} label={__('Type')} />
              </th>
              <th>
                <SortHandler sortField={'billType'} label={__('Bill Type')} />
              </th>
              <th>
                <SortHandler sortField={'companyRD'} label={__('Company RD')} />
              </th>
              <th>
                <SortHandler
                  sortField={'customerType'}
                  label={__('Customer type')}
                />
              </th>
              <th>
                <SortHandler sortField={'customer'} label={__('Customer')} />
              </th>
              <th>
                <SortHandler sortField={'barcode'} label={__('Barcode')} />
              </th>
              <th>
                <SortHandler sortField={'subBarcode'} label={__('Factor')} />
              </th>
              <th>
                <SortHandler sortField={'code'} label={__('Code')} />
              </th>
              <th>
                <SortHandler
                  sortField={'categoryCode'}
                  label={__('Category code')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'categoryName'}
                  label={__('Category name')}
                />
              </th>
              <th>
                <SortHandler sortField={'name'} label={__('Name')} />
              </th>
              <th>
                <SortHandler sortField={'count'} label={__('Count')} />
              </th>
              <th>
                <SortHandler
                  sortField={'firstPrice'}
                  label={__('First price')}
                />
              </th>
              <th>
                <SortHandler sortField={'discount'} label={__('Discount')} />
              </th>
              <th>
                <SortHandler
                  sortField={'discountType'}
                  label={__('Discount type')}
                />
              </th>
              <th>
                <SortHandler sortField={'salePrice'} label={__('Sale price')} />
              </th>
              <th>
                <SortHandler sortField={'amount'} label={__('Amount')} />
              </th>
              <th>
                <SortHandler sortField={'payType'} label={__('Payment type')} />
              </th>
              <th>Үйлдлүүд</th>
            </tr>
          </thead>
          <tbody id="orders">
            {(orders || []).map(order => (
              <Record
                order={order}
                key={`${order._id}_${order.items._id}`}
                history={history}
                otherPayTitles={[]}
              />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Pos Orders`)}
            queryParams={queryParams}
            submenu={menuPos}
          />
        }
        mainHead={header}
        footer={<Pagination count={1000} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={(orders || []).length}
            emptyText="Add in your first order!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(Orders);
