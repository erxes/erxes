import DateFilters from '@erxes/ui-forms/src/forms/containers/DateFilters';
import React from 'react';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import TagFilter from '../../containers/filters/TagFilter';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = { loadingMainQuery: boolean };

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
        {isEnabled('segments') && (
          <SegmentFilter
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        )}
        {isEnabled('tags') && (
          <TagFilter
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        )}
        {isEnabled('forms') && (
          <DateFilters
            type="contacts:company"
            loadingMainQuery={loadingMainQuery}
          />
        )}
      </Wrapper.Sidebar>
    );

    return null;
  }
}

export default Sidebar;
