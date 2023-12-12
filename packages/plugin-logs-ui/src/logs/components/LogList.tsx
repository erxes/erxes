import * as React from 'react';

import { __, router } from '@erxes/ui/src/utils';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { ILog } from '../types';
import LogRow from './LogRow';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Sidebar from './Sidebar';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import {
  FilterContainer,
  FlexItem,
  FlexRow,
  InputBar,
  Title
} from '@erxes/ui-settings/src/styles';

type Props = {
  history: any;
  queryParams: any;
  isLoading: boolean;
  errorMessage: string;
} & commonProps;

type commonProps = {
  logs: ILog[];
  count: number;
  refetchQueries: any;
};

type State = {
  searchValue?: string;
};

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Logs') }
];

class LogList extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      searchValue: this.props.queryParams.searchValue || ''
    };
  }

  searchHandler = e => {
    const { history } = this.props;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const inputValue = e.target.value;
    this.setState({ searchValue: inputValue });

    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue: inputValue });
    }, 500);
  };

  renderObjects() {
    const { logs } = this.props;
    const rows: JSX.Element[] = [];

    if (!logs) {
      return rows;
    }

    for (const log of logs) {
      rows.push(<LogRow key={log._id} log={log} />);
    }

    return rows;
  }

  renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            <th>{__('Date')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Module')}</th>
            <th>{__('Action')}</th>
            <th>{__('Description')}</th>
            <th>{__('Changes')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  actionBarRight() {
    const { searchValue } = this.state;

    return (
      <FilterContainer>
        <FlexRow>
          <InputBar type="searchBar">
            <Icon icon="search-1" size={20} />
            <FlexItem>
              <FormControl
                type="text"
                placeholder={__('Type to search')}
                onChange={this.searchHandler}
                autoFocus={true}
                value={searchValue}
              />
            </FlexItem>
          </InputBar>
        </FlexRow>
      </FilterContainer>
    );
  }

  render() {
    const { isLoading, count, errorMessage, queryParams, history } = this.props;

    if (errorMessage.indexOf('Permission required') !== -1) {
      return (
        <EmptyState
          text={__('Permission denied')}
          image="/images/actions/21.svg"
        />
      );
    }

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Logs')}
            breadcrumb={breadcrumb}
            queryParams={queryParams}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`Logs (${count})`)}</Title>}
            right={this.actionBarRight()}
            background="colorWhite"
            wideSpacing={true}
          />
        }
        footer={<Pagination count={count} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={isLoading}
            count={count}
            emptyText={__('There are no logs recorded')}
            emptyImage="/images/actions/21.svg"
          />
        }
        hasBorder={true}
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
      />
    );
  }
}

export default LogList;
