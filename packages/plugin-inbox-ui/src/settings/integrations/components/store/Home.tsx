import {
  FullHeight,
  IntegrationWrapper
} from '@erxes/ui-inbox/src/settings/integrations/components/store/styles';

import { ByKindTotalCount } from '@erxes/ui-inbox/src/settings/integrations/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { INTEGRATIONS } from '@erxes/ui/src/constants/integrations';
import React from 'react';
import Row from './Row';
import { __ } from 'coreui/utils';
import { DataWithLoader, FormControl, Icon } from '@erxes/ui/src/components';
import { FlexItem, InputBar } from '@erxes/ui-settings/src/styles';
import Integration from '../../../Integration';

type Props = {
  totalCount: ByKindTotalCount;
  queryParams: any;
  customLink: (kind: string, addLink: string) => void;
  loading: boolean;
};

type State = {
  searchValue: string;
  integrations: any;
  filteredIntegrations: any;
};

class Home extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let integrations = [...INTEGRATIONS];
    const pluginsWithIntegrations = (window as any).plugins.filter(
      plugin => plugin.inboxIntegrations
    );

    for (const p of pluginsWithIntegrations) {
      integrations = integrations.concat(p.inboxIntegrations);
    }

    this.state = {
      searchValue: '',
      integrations,
      filteredIntegrations: integrations
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { searchValue, integrations } = this.state;
    const { queryParams } = this.props;

    if (
      prevProps.queryParams.kind !== queryParams.kind ||
      prevState.searchValue !== searchValue
    ) {
      this.setState({
        filteredIntegrations: integrations.filter(
          integration =>
            integration.name.toLowerCase().indexOf(searchValue) !== -1 &&
            integration.category.indexOf(
              queryParams.type || 'All integrations'
            ) !== -1
        )
      });
    }
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  renderIntegrations() {
    const { filteredIntegrations, searchValue } = this.state;
    const { totalCount, queryParams, customLink } = this.props;

    const datas = [] as any;
    const rows = [...filteredIntegrations];

    while (rows.length > 0) {
      datas.push(
        <Row
          key={rows.length}
          integrations={rows.splice(0, 4)}
          totalCount={totalCount}
          customLink={customLink}
          queryParams={queryParams}
        />
      );
    }

    if (datas.length === 0) {
      return (
        <FullHeight>
          <EmptyState
            text={`No results for "${searchValue}`}
            image="/images/actions/2.svg"
          />
        </FullHeight>
      );
    }

    return datas;
  }

  renderContent = () => {
    const content = (
      <IntegrationWrapper>{this.renderIntegrations()}</IntegrationWrapper>
    );

    return (
      <DataWithLoader
        data={content}
        loading={this.props.loading}
        emptyText={'There is no Action'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    );
  };

  actionButtons = () => {
    return (
      <InputBar type="searchBar">
        <Icon icon="search-1" size={20} />
        <FlexItem>
          <FormControl
            placeholder={__('Type to search')}
            name="searchValue"
            onChange={this.onSearch}
            autoFocus={true}
          />
        </FlexItem>
      </InputBar>
    );
  };

  render() {
    return (
      <Integration
        action={this.actionButtons()}
        content={this.renderContent()}
        tab="integrations"
      />
    );
  }
}

export default Home;
