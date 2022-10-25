import React from 'react';

import {
  Content,
  FullHeight,
  IntegrationWrapper
} from '@erxes/ui-inbox/src/settings/integrations/components/store/styles';
import { __ } from '@erxes/ui/src/utils/core';
import { ByKindTotalCount } from '@erxes/ui-inbox/src/settings/integrations/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { INTEGRATIONS } from '@erxes/ui/src/constants/integrations';
import Row from './Row';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  totalCount: ByKindTotalCount;
  queryParams: any;
  customLink: (kind: string, addLink: string) => void;
};

type State = {
  searchValue: string;
  integrations: any;
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
      integrations
    };
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  renderIntegrations() {
    const { integrations, searchValue } = this.state;
    const { totalCount, queryParams, customLink } = this.props;

    const list = [] as any;
    const rows = [...integrations];

    for (const row of rows) {
      list.push(
        <Row
          key={row.kind}
          integrations={rows.splice(0, 5)}
          totalCount={totalCount}
          customLink={customLink}
          queryParams={queryParams}
        />
      );
    }

    if (list.length === 0) {
      return (
        <FullHeight>
          <EmptyState
            text={`No results for "${searchValue}"`}
            image="/images/actions/2.svg"
          />
        </FullHeight>
      );
    }

    return list;
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Integrations') }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/33.svg"
        title="Integrations"
        description={`${__(
          'Set up your integrations and start connecting with your customers'
        )}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Integrations')} breadcrumb={breadcrumb} />
        }
        mainHead={headerDescription}
        content={
          <Content>
            <IntegrationWrapper>{this.renderIntegrations()}</IntegrationWrapper>
          </Content>
        }
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default Home;
