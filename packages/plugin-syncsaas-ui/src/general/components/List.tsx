import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  Pagination,
  Table,
  Wrapper,
  __,
  router
} from '@erxes/ui/src/';
import React from 'react';
import { Link } from 'react-router-dom';
import { TableHead } from '../common/utils';
import { headers } from './Headers';
import Row from './Row';
import SideBar from './Sidebar';

type Props = {
  list: any[];
  totalCount: number;
  history: any;
  queryParams: any;
  remove: (_id: string) => void;
};

type State = {
  perPage: number;
  searchValue?: string;
};

class List extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props: any) {
    super(props);
    this.state = {
      perPage: 20,
      searchValue: ''
    };
  }

  renderSearchField = () => {
    const search = e => {
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
    const moveCursorAtTheEnd = e => {
      const tmpValue = e.target.value;

      e.target.value = '';
      e.target.value = tmpValue;
    };
    return (
      <FormControl
        type="text"
        placeholder="type a search"
        onChange={search}
        autoFocus={true}
        value={this.state.searchValue}
        onFocus={moveCursorAtTheEnd}
      />
    );
  };

  renderRow(item: any, key: number) {
    const { remove, queryParams } = this.props;

    const updatedProps = {
      item,
      key,
      remove,
      queryParams
    };
    return <Row {...updatedProps} key={key} />;
  }

  renderForm() {
    return (
      <Link to={`/settings/sync-saas/add`}>
        <Button btnStyle="success">{__('Add')}</Button>
      </Link>
    );
  }

  renderContent() {
    const { list, queryParams, history } = this.props;

    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Sub Domain')}</th>
              {headers(queryParams, history).map(header => (
                <TableHead
                  key={header.name}
                  filter={header.filter}
                  sort={header.sort}
                >
                  {header.label}
                </TableHead>
              ))}
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{list.map(item => this.renderRow(item, item._id))}</tbody>
        </Table>
      </div>
    );
  }

  render() {
    const { queryParams, totalCount } = this.props;

    const leftActionBar = (
      <HeaderDescription
        title="Sync Saas"
        icon="/images/actions/8.svg"
        description=""
      />
    );

    const rightActionBar = (
      <BarItems>
        {this.renderSearchField()}
        {this.renderForm()}
      </BarItems>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={'Sync Saas'} />}
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
        }
        leftSidebar={
          <SideBar history={this.props.history} queryParams={queryParams} />
        }
        content={this.renderContent()}
        footer={<Pagination count={totalCount} />}
      />
    );
  }
}

export default List;
