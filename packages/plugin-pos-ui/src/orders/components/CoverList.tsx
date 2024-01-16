import {
  BarItems,
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
} from '@erxes/ui/src';
import { IQueryParams, IRouterProps } from '@erxes/ui/src/types';

// import { withRouter } from 'react-router-dom';
import CoverSidebar from './CoverSidebar';
import { ICover } from '../types';
import React from 'react';
import Row from './CoverRow';
import { TableWrapper } from '../../styles';
import { menuPos } from '../../constants';

interface IProps extends IRouterProps {
  covers: ICover[];
  bulk: any[];
  isAllSelected: boolean;
  history: any;
  queryParams: any;
  coversCount: number;

  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  remove: (_id: string) => void;
}

class Covers extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);
  }

  moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const { covers, history, queryParams, remove, coversCount } = this.props;

    const mainContent = (
      <TableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <SortHandler sortField={'beginDate'} label={__('Begin Date')} />
              </th>
              <th>
                <SortHandler sortField={'endDate'} label={__('End Date')} />
              </th>
              <th>
                <SortHandler sortField={'posToken'} label={__('POS')} />
              </th>
              <th>
                <SortHandler sortField={'user'} label={__('User')} />
              </th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody id="covers">
            {(covers || []).map((cover) => (
              <Row
                cover={cover}
                key={cover._id}
                history={history}
                remove={remove}
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
            title={__(`Pos Covers`)}
            queryParams={queryParams}
            submenu={menuPos}
          />
        }
        leftSidebar={
          <CoverSidebar queryParams={queryParams} history={history} />
        }
        footer={<Pagination count={coversCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={false}
            count={(covers || []).length}
            emptyText="Add in your first cover!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default Covers;
