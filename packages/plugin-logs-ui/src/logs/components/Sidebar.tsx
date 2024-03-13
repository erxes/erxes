import React from 'react';
import { __ } from '@erxes/ui/src/utils';

import { Wrapper } from '@erxes/ui/src/layout';

import UserFilter from '../containers/filters/UserFilter';
import ActionFilter from './filters/ActionFilter';
import ModuleFilter from './filters/ModuleFilter';
import DateFilter from './filters/DateFilter';

type Props = {
  history: any;
  queryParams: any;
};

class Sidebar extends React.Component<Props> {
  private abortController;
  constructor(props) {
    super(props);
    this.abortController = new AbortController();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  render() {
    const { history, queryParams } = this.props;

    return (
      <Wrapper.Sidebar hasBorder={true}>
        <ModuleFilter history={history} queryParams={queryParams} />
        <ActionFilter history={history} queryParams={queryParams} />
        <UserFilter
          queryParams={queryParams}
          abortController={this.abortController}
          history={history}
        />
        <DateFilter history={history} queryParams={queryParams} />
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
