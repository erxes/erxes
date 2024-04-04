import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { categoryApprovalStates } from '../../constants';

interface IProps extends IRouterProps {
  emptyText?: string;
}

function CategoryApprovalStateFilter({ history, emptyText }: IProps) {
  const data = (
    <SidebarList>
      {categoryApprovalStates.map((categoryApprovalState, index) => {
        const onClick = () => {
          router.setParams(history, {
            categoryApprovalState: categoryApprovalState.key
          });
          router.removeParams(history, 'page');
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'categoryApprovalState') ===
                categoryApprovalState.key
                  ? 'active'
                  : ''
              }
              onClick={onClick}
            >
              <FieldStyle>{__(categoryApprovalState.value)}</FieldStyle>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by Approval State')}
      collapsible={categoryApprovalStates.length > 5}
      name="showFilterBycategoryApprovalState"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={categoryApprovalStates.length}
        emptyText={emptyText ? emptyText : 'Loading'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(CategoryApprovalStateFilter);
