import DataWithLoader from 'modules/common/components/DataWithLoader';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IIntegration } from 'modules/settings/integrations/types';
import React from 'react';
import { withRouter } from 'react-router';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  integrations: IIntegration[];
  loading: boolean;
}

function Forms({ history, counts, integrations, loading }: IProps) {
  const { Section, Header } = Wrapper.Sidebar;

  const onClick = formId => {
    router.setParams(history, { form: formId });
  };

  const data = (
    <SidebarList>
      {integrations.map(integration => {
        const form = integration.form || {};

        return (
          <li key={integration._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'form') === form._id ? 'active' : ''
              }
              onClick={onClick.bind(null, form._id)}
            >
              {integration.name}
              <SidebarCounter>{counts[form._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Section collapsible={integrations.length > 5}>
      <Header uppercase={true}>{__('Filter by form')}</Header>

      <DataWithLoader
        data={data}
        loading={loading}
        count={integrations.length}
        emptyText="Search and filter customers by form"
        emptyIcon="monitor"
        size="small"
        objective={true}
      />
    </Section>
  );
}

export default withRouter<IProps>(Forms);
