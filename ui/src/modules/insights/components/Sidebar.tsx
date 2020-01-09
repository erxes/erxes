import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { SidebarList } from 'modules/layout/styles';
import queryString from 'query-string';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { DEAL_INSIGHTS, INBOX_INSIGHTS, INSIGHT_TYPES } from '../constants';
import { IInsightType } from '../types';

type Props = {
  type?: string;
  queryParams?: any;
};

class Sidebar extends React.Component<Props> {
  getInsights() {
    const { type = INSIGHT_TYPES.INBOX } = this.props;

    return type === INSIGHT_TYPES.INBOX ? INBOX_INSIGHTS : DEAL_INSIGHTS;
  }

  renderItem(insight: IInsightType) {
    const { name, to } = insight;
    const { queryParams } = this.props;

    const search = queryString.stringify(queryParams);

    return (
      <li key={to}>
        <NavLink
          activeClassName="active"
          to={{
            pathname: to,
            search
          }}
        >
          {__(name)}
        </NavLink>
      </li>
    );
  }

  render() {
    const WrapperSidebar = Wrapper.Sidebar;
    const { Title } = WrapperSidebar.Section;

    return (
      <WrapperSidebar>
        <WrapperSidebar.Section>
          <Title>{__('Insights')}</Title>
          <SidebarList>
            {this.getInsights().map(insight => this.renderItem(insight))}
          </SidebarList>
        </WrapperSidebar.Section>
      </WrapperSidebar>
    );
  }
}

export default Sidebar;
