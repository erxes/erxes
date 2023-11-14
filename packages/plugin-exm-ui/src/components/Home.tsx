import React from 'react';

import { router, __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { Link } from 'react-router-dom';
import { IExm } from '../types';
import {
  Button,
  FormControl,
  Pagination,
  Table
} from '@erxes/ui/src/components';
import SideBar from './SideBar';
import { BarItems } from '@erxes/ui/src/layout';
import Row from './Row';

type Props = {
  queryParams: any;
  history: any;
  list: IExm[];
  totalCount: number;
  remove: (_id: string) => void;
};

type State = {
  perPage: number;
  searchValue?: string;
};

class Home extends React.Component<Props, State> {
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

  renderForm = () => {
    return (
      <Link to={`/erxes-plugin-exm/home/add`}>
        <Button btnStyle="success">{__('Add')}</Button>
      </Link>
    );
  };

  renderRow(item: any, key: string) {
    const { remove, queryParams } = this.props;

    const updatedProps = {
      item,
      key,
      remove,
      queryParams
    };
    return <Row {...updatedProps} key={key} />;
  }

  content = () => {
    const { list } = this.props;

    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {(list || []).map(item => this.renderRow(item, item._id))}
          </tbody>
        </Table>
      </div>
    );
  };

  render() {
    const { queryParams, totalCount, history } = this.props;

    const rightActionBar = (
      <BarItems>
        {this.renderSearchField()}
        {this.renderForm()}
      </BarItems>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={'Exm core'}
            breadcrumb={[{ title: 'Exm core' }]}
          />
        }
        actionBar={<Wrapper.ActionBar right={rightActionBar} />}
        leftSidebar={<SideBar history={history} queryParams={queryParams} />}
        content={this.content()}
        footer={<Pagination count={totalCount} />}
      />
    );
  }
}

export default Home;
