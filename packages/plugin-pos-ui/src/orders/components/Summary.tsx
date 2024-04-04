import {
  __,
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  BarItems,
  FormControl,
  ControlLabel
} from '@erxes/ui/src';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuPos } from '../../constants';

import { TableWrapper } from '../../styles';
import HeaderDescription from './MainHead';
import RightMenu from './RightMenu';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  loading: boolean;
  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  summary: any;
}

class Orders extends React.Component<IProps, {}> {
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
      queryParams,
      loading,
      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      summary
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
        <ControlLabel>Group Type:</ControlLabel>
        <FormControl
          value={queryParams.groupField}
          componentClass="select"
          onChange={e =>
            this.props.onFilter({ groupField: (e.target as any).value })
          }
        >
          <option value="">Undefined</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
        </FormControl>

        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    const { amounts, columns } = summary;
    const staticKeys = ['count', 'totalAmount', 'cashAmount', 'mobileAmount'];
    const otherPayTitles = (columns ? Object.keys(columns) || [] : [])
      .filter(a => !['_id'].includes(a))
      .filter(a => !staticKeys.includes(a))
      .sort();

    const header = (
      <HeaderDescription
        icon="/images/actions/26.svg"
        title=""
        summary={{}}
        staticKeys={staticKeys}
        actionBar={actionBarRight}
      />
    );

    const mainContent = (
      <TableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <SortHandler sortField={''} label={__('Group')} />
              </th>
              <th>
                <SortHandler sortField={''} label={__('Count')} />
              </th>
              <th>
                <SortHandler sortField={''} label={__('Cash Amount')} />
              </th>
              <th>
                <SortHandler sortField={''} label={__('Mobile Amount')} />
              </th>
              {otherPayTitles.map(key => (
                <th key={Math.random()}>{__(key)}</th>
              ))}
              <th>
                <SortHandler sortField={''} label={__('Amount')} />
              </th>
            </tr>
          </thead>
          <tbody id="orders">
            {(amounts || []).map(item => (
              <tr key={Math.random()}>
                <td>{item.paidDate}</td>
                <td>{item.count}</td>
                <td>{item.cashAmount}</td>
                <td>{item.mobileAmount}</td>
                {otherPayTitles.map(key => (
                  <td key={Math.random()}>{item[key]}</td>
                ))}
                <td>{item.totalAmount}</td>
              </tr>
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
        footer={<Pagination count={amounts.length} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={amounts.length}
            emptyText="Add in your first order!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(Orders);
