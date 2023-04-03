import { Sidebar } from '@erxes/ui/src';
import React from 'react';
import { FilterByTags } from '../../common/utils';
type Props = {
  queryParams: any;
  history: any;
};

class SideBar extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { history, queryParams } = this.props;

    return (
      <Sidebar>
        <FilterByTags history={history} queryParams={queryParams} />
      </Sidebar>
    );
  }
}

export default SideBar;
