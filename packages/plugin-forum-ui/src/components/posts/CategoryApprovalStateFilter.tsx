import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IRouterProps, Counts } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { categoryApprovalStates } from '../../constants';

interface IProps extends IRouterProps {
  counts: Counts;
  emptyText?: string;
}

function CategoryApprovalStateFilter({ history, counts, emptyText }: IProps) {
  const data = (
    <SidebarList>
      {categoryApprovalStates.map((categoryApprovalState, index) => {
        const onClick = () => {
          router.setParams(history, {
            categoryApprovalState: categoryApprovalState.key
          });
          router.removeParams(history, 'categoryApprovalState');
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
              {/* <SidebarCounter>{counts[categoryApprovalState.key]}</SidebarCounter> */}
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
