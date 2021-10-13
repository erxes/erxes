import { TopHeader } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { SidebarListItem } from 'modules/settings/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import TagFilter from '../../containers/TagFilter';
// import { IProductCategory } from '../../types';
import ProductTypeFilter from '../product/filters/ProdcutTypeFilter';
import SidebarHeader from 'modules/settings/common/components/SidebarHeader';

const TEMPLATE_TYPES = {
  EMAILS: 'Emails',
  CHAT_RESPONSES: 'Chat Responses',
  PRODUCTS_SERVICES: 'Products & Services',
  SEGMENTS: 'Segments',
  SALES_PIPELINE: 'Sales Pipeline',
  AUTOMATION: 'Automation'
};

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  refetch?: any;
  remove?: (productCategoryId: string) => void;
  // productCategories: IProductCategory[];
  productCategoriesCount: number;
  loading: boolean;
}

class List extends React.Component<IProps> {
  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.type || '';

    return currentGroup === id;
  };

  renderContent() {
    const result: React.ReactNode[] = [];

    for (const key of Object.keys(TEMPLATE_TYPES)) {
      // const name = category.isRoot ? (
      //   `${category.name}`
      // ) : (
      //   <span>
      //     {category.name}
      //   </span>
      // );
      const name = TEMPLATE_TYPES[key];

      // const count = category.isRoot ? (
      //   `${category.productCount}`
      // ) : (
      //   <span>
      //     {category.productCount}
      //   </span>
      // );

      const count = 0;

      result.push(
        <SidebarListItem
          key={key}
          isActive={this.isActive(key)}
        >
          <Link to={`?type=${key}`}>
            {name}
          </Link>
          <SidebarCounter>{count}</SidebarCounter>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderCategoryHeader() {
    return (
      <>
        <TopHeader><SidebarHeader /></TopHeader>
        <Section.Title>
          {__('Types')}
        </Section.Title>
      </>
    );
  }

  renderCategoryList() {
    return (
      <SidebarList>
        {this.renderContent()}
      </SidebarList>
    );
  }

  render() {
    return (
      <Sidebar wide={true}>
        <Section
          maxHeight={488}
        >
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
