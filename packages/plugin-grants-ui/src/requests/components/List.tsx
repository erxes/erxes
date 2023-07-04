import React from 'react';
import { IGrantRequest } from '../../common/type';
import { DefaultWrapper } from '../../common/utils';
import {
  BarItems,
  Button,
  FormControl,
  SortHandler,
  Table,
  __
} from '@erxes/ui/src';
import Row from './Row';
import SideBar from './SideBar';

type Props = {
  queryParams: any;
  history: any;
  list: IGrantRequest[];
  totalCount: number;
  handleRemove: (ids: string[]) => void;
};

type State = {
  selectedRequests: string[];
  searchValue?: string;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedRequests: []
    };
  }

  renderList() {
    const { list, queryParams, history } = this.props;
    const { selectedRequests } = this.state;
    const requestIds = list
      .map(item => item._id)
      .filter((value): value is string => typeof value === 'string');

    const handleSelectAll = () => {
      if (!!selectedRequests.length) {
        return this.setState({ selectedRequests: [] });
      }

      this.setState({ selectedRequests: requestIds });
    };

    const handleSelect = (id: string) => {
      if (selectedRequests.includes(id)) {
        return this.setState({
          selectedRequests: selectedRequests.filter(
            selectedId => selectedId !== id
          )
        });
      }

      this.setState({ selectedRequests: [...selectedRequests, id] });
    };

    const checked = selectedRequests.length === requestIds.length;

    return (
      <Table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={checked}
                componentClass="checkbox"
                onChange={handleSelectAll}
              />
            </th>
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
            <Row
              request={item}
              key={item._id}
              selecteRequests={selectedRequests}
              onChange={handleSelect}
            />
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { queryParams, history, handleRemove } = this.props;
    const { selectedRequests } = this.state;

    const rightActionBar = (
      <BarItems>
        {!!selectedRequests?.length && queryParams?.archived !== 'true' && (
          <Button
            btnStyle="danger"
            onClick={handleRemove.bind(this, selectedRequests)}
          >
            {`Remove (${selectedRequests?.length || 0})`}
          </Button>
        )}
      </BarItems>
    );

    const updatedProps = {
      title: 'List Request',
      content: this.renderList(),
      rightActionBar,
      totalCount: this.props.totalCount,
      sidebar: <SideBar queryParams={queryParams} history={history} />
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
