import React from 'react';
import { useHistory } from 'react-router-dom';
// erxes
import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import { __, router } from '@erxes/ui/src/utils';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { STATUS_FILTER_OPTIONS } from '../../../constants';

const StatusFilter = () => {
  const history = useHistory();
  const paramKey = 'status';

  const handleClear = () => router.setParams(history, { [paramKey]: null });

  const handleOnClick = (value: string) =>
    router.setParams(history, { [paramKey]: value });

  const renderExtraButtons = () =>
    router.getParam(history, 'status') && (
      <a href="#cancel" tabIndex={0} onClick={handleClear}>
        <Icon icon="cancel-1" />
      </a>
    );

  const renderOptions = () => {
    return STATUS_FILTER_OPTIONS.map((item: string, index: number) => (
      <li key={`status-filter-${index}`}>
        <a
          href="#filter"
          tabIndex={0}
          className={
            router.getParam(history, [paramKey]) === item ? 'active' : ''
          }
          onClick={() => handleOnClick(item)}
        >
          <FieldStyle>
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </FieldStyle>
        </a>
      </li>
    ));
  };

  return (
    <Box
      extraButtons={renderExtraButtons()}
      title={__('Filter category by status')}
      name="showFilterByStatus"
    >
      <SidebarList>{renderOptions()}</SidebarList>
    </Box>
  );
};

export default StatusFilter;
