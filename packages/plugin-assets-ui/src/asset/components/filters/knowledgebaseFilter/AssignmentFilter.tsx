import React from 'react';
import { router } from '@erxes/ui/src/utils/core';
import { Box, FieldStyle, SidebarList, __ } from '@erxes/ui/src';
import { checkKnowledge } from '../../../../common/constant';

type Props = {
  queryParams: any;
  history: any;
};

function KnowledgebaseAssignmentFilter({ queryParams, history }: Props) {
  const handleWithKnowledge = type => {
    router.setParams(history, { state: type });
    router.removeParams(history, 'page');
  };

  const renderTypeContent = () => {
    return (
      <SidebarList>
        {checkKnowledge.map(type => (
          <li key={Math.random()}>
            <a
              href="#filter"
              tabIndex={0}
              className={queryParams.state === type.title ? 'active' : ''}
              onClick={handleWithKnowledge.bind(this, type.title)}
            >
              {/* <Icon icon={type.icon} /> */}
              <FieldStyle>{type.title}</FieldStyle>
            </a>
          </li>
        ))}
      </SidebarList>
    );
  };

  return (
    <Box
      title={__('Filter by Knowledgebase Assign')}
      name="showFilterByType"
      isOpen={queryParams.state}
    >
      {renderTypeContent()}
    </Box>
  );
}

export default KnowledgebaseAssignmentFilter;
