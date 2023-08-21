import BrandFilter from '../../containers/filters/BrandFilter';
import DateFilters from '@erxes/ui-forms/src/forms/containers/DateFilters';
import IntegrationFilter from '../../containers/filters/IntegrationFilter';
import LeadFilter from '../../containers/filters/LeadFilter';
import LeadStatusFilter from '../../containers/filters/LeadStatusFilter';
import React from 'react';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import TagFilter from '../../containers/filters/TagFilter';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  loadingMainQuery: boolean;
  type: string;

  queryParams?: any;
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
        {isEnabled('segments') && (
          <SegmentFilter
            type={type}
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        )}
        {isEnabled('tags') && (
          <TagFilter
            type={type}
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        )}
        {isEnabled('inbox') && (
          <IntegrationFilter
            type={type}
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        )}
        <BrandFilter
          type={type}
          loadingMainQuery={loadingMainQuery}
          abortController={this.abortController}
        />

        {isEnabled('inbox') && (
          <LeadFilter
            queryParams={this.props.queryParams}
            type={type}
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        )}
        {type === 'inbox' && (
          <LeadStatusFilter
            type={type}
            loadingMainQuery={loadingMainQuery}
            abortController={this.abortController}
          />
        )}
        {isEnabled('forms') && (
          <DateFilters
            type="contacts:customer"
            loadingMainQuery={loadingMainQuery}
          />
        )}
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
