import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __, router } from 'coreui/utils';

import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import { IRouterProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FormControl } from '@erxes/ui/src/components/form';
import { CustomPadding } from '@erxes/ui-contacts/src/customers/styles';

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
  let timer;
  const [searchValue, setSearchValue] = useState(
    router.getParam(history, 'searchTarget') || ''
  );

  const [disableLoadMoreBtn, setDisableLoadMoreBtn] = useState(false);

  const onClick = formId => {
    router.setParams(history, { form: formId });
    router.removeParams(history, 'page');
  };

  const search = e => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);
    setDisableLoadMoreBtn(true);

    if (inputValue === '') {
      setDisableLoadMoreBtn(false);
    }
    timer = setTimeout(() => {
      router.setParams(history, { searchTarget: inputValue });
    }, 1000);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  };

  const renderIntegrations = () => {
    return integrations.map(integration => {
      const form = integration.form || ({} as any);

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
    });
  };

  const data = (
    <SidebarList>
      {renderIntegrations()}

      {all !== integrations.length && !disableLoadMoreBtn ? (
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
    <Box title={__('Filter by Forms')} name="showFilterByPopUps">
      <CustomPadding>
        <FormControl
          type="text"
          onChange={search}
          placeholder={__('Type to search')}
          value={searchValue}
          onFocus={moveCursorAtTheEnd}
        />
      </CustomPadding>
      <DataWithLoader
        data={data}
        loading={loading}
        count={integrations.length}
        emptyText="Search and filter customers by forms"
        emptyIcon="monitor"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(Leads);
