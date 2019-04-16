import { DataWithLoader } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { withRouter } from 'react-router';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  brands: IBrand[];
  loading: boolean;
}

function Brands({ history, counts, brands, loading }: IProps) {
  const { Section, Header } = Wrapper.Sidebar;

  const data = (
    <SidebarList>
      {brands.map(brand => {
        const onClick = () => {
          router.setParams(history, { brand: brand._id });
        };

        return (
          <li key={brand._id}>
            <a
              tabIndex={0}
              className={
                router.getParam(history, 'brand') === brand._id ? 'active' : ''
              }
              onClick={onClick}
            >
              {brand.name}
              <SidebarCounter>{counts[brand._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Section collapsible={brands.length > 5}>
      <Header uppercase={true}>{__('Filter by brand')}</Header>

      <DataWithLoader
        data={data}
        loading={loading}
        count={brands.length}
        emptyText="Now easier to find contacts according to your brand"
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Section>
  );
}

export default withRouter<IProps>(Brands);
