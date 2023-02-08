import { DataWithLoader, Pagination, Table } from '@erxes/ui/src/components';
import { router, __ } from '@erxes/ui/src/utils';
import { Wrapper, BarItems } from '@erxes/ui/src/layout';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import { TableWrapper } from '../styles';
import { IPutResponse } from '../types';
import RightMenu from './RightMenu';
import { displayValue } from './PutResponseRow';

interface IProps extends IRouterProps {
  putResponses: IPutResponse[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  sumAmount: number;
  bulk: any[];
  isAllSelected: boolean;
  history: any;
  queryParams: any;

  onSearch: (search: string, key?: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
}

type State = {
  searchValue?: string;
};

class PutResponsesByDate extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

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

  renderRow(putResponse, index) {
    const { date, values } = putResponse;
    return (
      <tr>
        <td>{index + 1} </td>
        <td>{date} </td>
        <td>{values.counter.toLocaleString()} </td>
        <td>{values.cityTax.toLocaleString()} </td>
        <td>{values.vat.toLocaleString()} </td>
        <td>{values.amount.toLocaleString()} </td>
      </tr>
    );
  }

  render() {
    const {
      putResponses,
      loading,
      totalCount,
      sumAmount,
      queryParams,

      onSearch,
      onFilter,
      onSelect,
      isFiltered,
      clearFilter
    } = this.props;
    const mainContent = (
      <TableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>{__('№')}</th>
              <th>{__('Date')}</th>
              <th>{__('Count')}</th>
              <th>{__('CityTax')}</th>
              <th>{__('Vat')}</th>
              <th>{__('Amount')}</th>
            </tr>
          </thead>
          <tbody id="putResponses">
            {(putResponses || []).map((putResponse, index) =>
              this.renderRow(putResponse, index)
            )}
          </tbody>
        </Table>
      </TableWrapper>
    );

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
        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={`Total: ${totalCount} #SumAmount: ${(
          sumAmount || 0
        ).toLocaleString()}`}
      />
    );

    const menuPos = [
      { title: 'Put Response', link: '/put-responses' },
      { title: 'By Date', link: '/put-responses-by-date' }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Put Response`)}
            queryParams={queryParams}
            submenu={menuPos}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={totalCount}
            emptyText="Add in your first putResponse!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(PutResponsesByDate);
