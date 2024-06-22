import React from 'react';
import { router } from '@erxes/ui/src/utils/core';
import { Box, FieldStyle, SidebarList, __ } from '@erxes/ui/src';
import { checkKnowledge } from '../../../../common/constant';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
  queryParams: any;
};

const AssignmentFilter = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const handleWithKnowledge = (type) => {
    router.setParams(navigate, location, { state: type, page: undefined });
  };

  const renderTypeContent = () => {
    return (
      <SidebarList>
        {checkKnowledge.map((type) => (
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
};

export default AssignmentFilter;
