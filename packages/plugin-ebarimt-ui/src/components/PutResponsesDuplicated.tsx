import { DataWithLoader, ModalTrigger, Pagination, Table, WithPermission } from '@erxes/ui/src/components';
import { router, __ } from '@erxes/ui/src/utils';
import { Wrapper, BarItems } from '@erxes/ui/src/layout';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import { TableWrapper } from '../styles';
import { IPutResponse } from '../types';
import RightMenu from './RightMenuDuplicated';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { SUB_MENUS } from '../constants';
import DetailDuplicated from '../containers/DetailDuplicated';

interface IProps extends IRouterProps {
  errorMsg: string;
  putResponsesDuplicated: IPutResponse[];
  loading: boolean;
  totalCount: number;
  sumAmount: number;
  bulk: any[];
  isAllSelected: boolean;
  history: any;
  queryParams: any;

  onSearch: (search: string, key?: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  isFiltered: boolean;
  clearFilter: () => void;
}

type State = {
};

class PutResponsesDuplicated extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);
  }



  renderRow(putResponse, index) {
    const { _id, date, number, count } = putResponse;

    const modalContent = _props => {
      return <DetailDuplicated contentId={_id.contentId} taxType={_id.taxType} />;
    };

    const trigger = (
      <tr key={Math.random()}>
        <td>{index + 1} </td>
        <td>{date} </td>
        <td>{number} </td>
        <td>{count.toLocaleString()} </td>
      </tr>
    );

    return (
      <ModalTrigger
        key={Math.random()}
        title={`Order detail`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={modalContent}
        size={'xl'}
      />
    );
  }

  render() {
    const {
      putResponsesDuplicated,
      loading,
      totalCount,
      sumAmount,
      queryParams,
      errorMsg,
      onSearch,
      onFilter,
      isFiltered,
      clearFilter
    } = this.props;

    const mainContent = errorMsg ? (
      <EmptyState
        text={errorMsg.replace('GraphQL error: ', '')}
        size="full"
        image={'/images/actions/11.svg'}
      />
    ) : (
      <TableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>{__('№')}</th>
              <th>{__('Date')}</th>
              <th>{__('Number')}</th>
              <th>{__('Count')}</th>
            </tr>
          </thead>
          <tbody id="putResponses">
            {(putResponsesDuplicated || []).map((putResponse, index) =>
              this.renderRow(putResponse, index)
            )}
          </tbody>
        </Table>
      </TableWrapper>
    );

    const rightMenuProps = {
      onFilter,
      onSearch,
      isFiltered,
      clearFilter,
      queryParams,
      showMenu: errorMsg ? true : false
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

    return (

      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Put Response`)}
            queryParams={queryParams}
            submenu={SUB_MENUS}
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

export default withRouter<IRouterProps>(PutResponsesDuplicated);
