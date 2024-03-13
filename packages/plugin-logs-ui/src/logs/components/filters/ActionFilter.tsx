import { __, router } from 'coreui/utils';
import { FieldStyle, SidebarList, Box, DataWithLoader } from '@erxes/ui/src';
import React from 'react';

type Props = {
  history: any;
  queryParams: any;
};

const actionOptions = [
  { value: 'create', label: __('Create') },
  { value: 'update', label: __('Update') },
  { value: 'delete', label: __('Delete') }
];

function ActionFilter({ history, queryParams }: Props) {
  const onClick = action => {
    router.setParams(history, { action: action.value });
    router.removeParams(history, 'page');
  };

  const content = (
    <SidebarList>
      {actionOptions.map(action => {
        return (
          <li key={action.value}>
            <a
              href="#filter"
              tabIndex={0}
              className={queryParams.action === action.value ? 'active' : ''}
              onClick={() => onClick(action)}
            >
              <FieldStyle>{action.label}</FieldStyle>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by Action')}
      name="showFilterByAction"
      isOpen={queryParams.action}
    >
      <DataWithLoader
        data={content}
        loading={false}
        count={actionOptions.length}
        emptyText={'There is no Action'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default ActionFilter;
