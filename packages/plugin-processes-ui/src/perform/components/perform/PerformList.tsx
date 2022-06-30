import React from 'react';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { Count } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';

import { menuContacts1 } from '../../../constants';
import { IWorkDocument } from '../../types';
import Row from './PerformRow';
import OverallWorkSideBar from '../../containers/OverallWorkSideBar';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  works: IWorkDocument[];
  worksCount: number;
  loading: boolean;
  searchValue: string;
}

type State = {
  searchValue?: string;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  renderRow = () => {
    const { works, history } = this.props;
    return works.map(work => (
      <Row history={history} key={work._id} work={work} />
    ));
  };

  renderCount = worksCount => {
    return (
      <Count>
        {worksCount} work{worksCount > 1 && 's'}
      </Count>
    );
  };

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

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    const { worksCount, loading, queryParams, history } = this.props;

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
      </BarItems>
    );

    const content = (
      <>
        {this.renderCount(worksCount || 0)}
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Status')}</th>
              <th>{__('Job')}</th>
              <th>{__('Flow')}</th>
              <th>{__('Product')}</th>
              <th>{__('Count')}</th>
              <th>{__('InBranch')}</th>
              <th>{__('InDepartment')}</th>
              <th>{__('OutBranch')}</th>
              <th>{__('OutDepartment')}</th>
              <th>{__('Interval')}</th>
              <th>{__('Need products')}</th>
              <th>{__('Result products')}</th>
              <th>{__('StartAt')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Work')} submenu={menuContacts1} />}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        leftSidebar={
          <OverallWorkSideBar queryParams={queryParams} history={history} />
        }
        footer={<Pagination count={worksCount || 0} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={worksCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default List;
