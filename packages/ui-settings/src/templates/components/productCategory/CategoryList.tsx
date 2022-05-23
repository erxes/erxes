import { __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes//ui/src/layout/components/Sidebar';
import Wrapper from '@erxes//ui/src/layout/components/Wrapper';
import { SidebarCounter, SidebarList } from '@erxes//ui/src/layout/styles';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';

import TagFilter from '../../containers/TagFilter';
import ProductTypeFilter from '../product/filters/ProdcutTypeFilter';
import { isEnabled } from '@erxes/ui/src/utils/core';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

const TEMPLATE_TYPES = {
  email_templates: 'Emails',
  response_templates: 'Chat Responses',
  growth_hacking: 'Growth Hacking',
  template: 'Products & Services'
};

const { Section } = Wrapper.Sidebar;

interface IProps {
  history?: any;
  queryParams: any;
  refetch?: any;
  types: any;
  loading: boolean;
}

class List extends React.Component<IProps> {
  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams ? queryParams.type : '';

    return currentGroup === id;
  };

  renderContent() {
    const result: React.ReactNode[] = [];
    const { types } = this.props;

    for (const key of Object.keys(TEMPLATE_TYPES)) {
      const name = TEMPLATE_TYPES[key];

      const count = types[key] || 0;
      const subroute =
        key === 'response_templates'
          ? 'response-templates'
          : key === 'growth_hacking'
          ? 'boards/growthHackTemplate'
          : key;
      const link = <Link to={`/settings/${subroute}?type=${key}`}>{name}</Link>;

      result.push(
        <SidebarListItem key={key} isActive={this.isActive(key)}>
          {link}
          <SidebarCounter>{count}</SidebarCounter>
        </SidebarListItem>
      );
    }

    return result;
  }

  render() {
    return (
      <Sidebar header={<SidebarHeader />} wide={true} hasBorder={true}>
        <Section noShadow={true} maxHeight={488}>
          <Section.Title>{__('Types')}</Section.Title>
          <SidebarList noTextColor noBackground>
            {this.renderContent()}
          </SidebarList>
        </Section>
        <ProductTypeFilter />
        {isEnabled('tags') && <TagFilter />}
      </Sidebar>
    );
  }
}

export default List;
