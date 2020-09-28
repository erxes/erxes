import Box from 'modules/common/components/Box';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IIntegration } from 'modules/settings/integrations/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  integrations: IIntegration[];
  loading: boolean;
  loadMore: () => void;
  all: number;
}

function Leads({
  history,
  counts,
  integrations = [],
  loading,
  loadMore,
  all
}: IProps) {
  const onClick = formId => {
    router.setParams(history, { form: formId });
    router.removeParams(history, 'page');
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
              <FieldStyle>{integration.name}</FieldStyle>
              <SidebarCounter>{counts[form._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}

      {all !== integrations.length ? (
        <Button
          block={true}
          btnStyle="link"
          onClick={loadMore}
          icon="angle-double-down"
        >
          Load more
        </Button>
      ) : null}
    </SidebarList>
  );

  return (
    <Box title={__('Filter by Pop Ups')} name="showFilterByPopUps">
      <DataWithLoader
        data={data}
        loading={loading}
        count={integrations.length}
        emptyText="Search and filter customers by pop ups"
        emptyIcon="monitor"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(Leads);
