import React from 'react';

import TagFilter from './TagFilter';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  loadingMainQuery: boolean;
  type: string;
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
    const { loadingMainQuery, type } = this.props;

    return (
      <Wrapper.Sidebar hasBorder>
        {isEnabled('tags') && (
          <TagFilter
            type={type}
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        )}
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
