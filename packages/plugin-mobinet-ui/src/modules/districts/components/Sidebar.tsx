import React from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import CityFilter from '../containers/filters/CityFilter';

type Props = {
  loadingMainQuery: boolean;
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
    const { loadingMainQuery } = this.props;

    return (
      <Wrapper.Sidebar hasBorder>
        <CityFilter
          loadingMainQuery={loadingMainQuery}
          abortController={this.abortController}
        />
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
