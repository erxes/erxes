import React from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import CityFilter from '../../districts/containers/filters/CityFilter';
import DistrictFilter from '../../quarters/containers/filters/DistrictFilter';

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
      <>
        <Wrapper.Sidebar hasBorder>
          <CityFilter
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />

          <DistrictFilter
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        </Wrapper.Sidebar>
      </>
    );
  }
}

export default Sidebar;
