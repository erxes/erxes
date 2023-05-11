import React from 'react';
import { IGrantRequest } from '../../common/type';
import { DefaultWrapper } from '../../common/utils';
import { FormControl, SortHandler, Table, __ } from '@erxes/ui/src';
import Row from './Row';
import SideBar from './SideBar';

type Props = {
  queryParams: any;
  history: any;
  list: IGrantRequest[];
  totalCount: number;
};

type State = {
  searchValue?: string;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderList() {
    const { list, queryParams, history } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Type')}</th>
            <th>{__('Name')}</th>
            <th>{__('Requester')}</th>
            <th>{__('Recipients')}</th>
            <th>{__('Status')}</th>
            <th>
              <SortHandler sortField="createdAt" />
              {__('Requested at')}
            </th>
            <th>
              <SortHandler sortField="resolvedAt" />
              {__('Resolved at')}
            </th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <Row request={item} key={item._id} />
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { queryParams, history } = this.props;

    const updatedProps = {
      title: 'List Request',
      content: this.renderList(),
      totalCount: this.props.totalCount,
      sidebar: <SideBar queryParams={queryParams} history={history} />
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
