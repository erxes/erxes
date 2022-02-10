import { TopHeader } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { SidebarListItem } from 'modules/settings/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import TagFilter from '../../containers/TagFilter';
import ProductTypeFilter from '../product/filters/ProdcutTypeFilter';
import SidebarHeader from 'modules/settings/common/components/SidebarHeader';

const TEMPLATE_TYPES = {
  email_templates: 'Emails',
  response_templates: 'Chat Responses',
  growth_hacking: 'Growth Hacking',
  template: 'Products & Services',
  segments: 'Segments',
  sales_pipeline: 'Sales Pipeline',
  automation: 'Automation'
};

const { Section } = Wrapper.Sidebar;

interface IProps {
  history?: any;
  queryParams: any;
  refetch?: any;
  types: any;
  loading: boolean;
}

const coming_soon = {
  margin: '10px',
  paddingLeft: '10px'
};

const coming_soon1 = {
  margin: '10px',
  color: 'brown'
};
class List extends React.Component<IProps> {
  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams ? queryParams.type : '';

    return currentGroup === id;
  };

  renderContent() {
    const result: React.ReactNode[] = [];
    const { types } = this.props;

    console.log(types);

    for (const key of Object.keys(TEMPLATE_TYPES)) {
      const name = TEMPLATE_TYPES[key];
      const condition =
        key === 'segments' || key === 'sales_pipeline' || key === 'automation';
      const count = condition ? (
        <p style={coming_soon1}>Comging soon</p>
      ) : (
        types[key] || 0
      );
      const subroute =
        key === 'response_templates'
          ? 'response-templates'
          : key === 'growth_hacking'
          ? 'boards/growthHackTemplate'
          : key;
      const link = condition ? (
        <p style={coming_soon}> {name} </p>
      ) : (
        <Link to={`/settings/${subroute}?type=${key}`}>{name}</Link>
      );

      result.push(
        <SidebarListItem key={key} isActive={this.isActive(key)}>
          {link}
          <SidebarCounter>{count}</SidebarCounter>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderCategoryHeader() {
    return (
      <>
        <TopHeader>
          <SidebarHeader />
        </TopHeader>
        <Section.Title>{__('Types')}</Section.Title>
      </>
    );
  }

  renderCategoryList() {
    return <SidebarList>{this.renderContent()}</SidebarList>;
  }

  render() {
    return (
      <Sidebar wide={true}>
        <Section maxHeight={488}>
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
        <ProductTypeFilter />
        <TagFilter />
      </Sidebar>
    );
  }
}

export default List;
