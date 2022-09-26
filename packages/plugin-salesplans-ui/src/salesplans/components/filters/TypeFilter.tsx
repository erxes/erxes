import React from 'react';
import { useHistory } from 'react-router-dom';
import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import { __, router } from '@erxes/ui/src/utils';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { TYPES } from '../../../constants';

const TypeFilter = () => {
  const history = useHistory();
  const paramKey = 'type';

  const handleClear = () => {
    router.setParams(history, { type: null });
  };

  const handleOnClick = (key: string, value: string) => {
    router.setParams(history, { [key]: value });
  };

  const extraButtons = router.getParam(history, 'type') && (
    <a href="#cancel" tabIndex={0} onClick={handleClear}>
      <Icon icon="cancel-1" />
    </a>
  );

  return (
    <Box
      extraButtons={extraButtons}
      title={__('Filter by type')}
      name="showFilterByType"
    >
      <SidebarList>
        {TYPES.map(
          (
            { value, label }: { value: string; label: string },
            index: number
          ) => {
            return (
              <li key={index}>
                <a
                  href="#filter"
                  tabIndex={0}
                  className={
                    router.getParam(history, [paramKey]) === value
                      ? 'active'
                      : ''
                  }
                  onClick={handleOnClick.bind(this, paramKey, value)}
                >
                  <FieldStyle>{label}</FieldStyle>
                </a>
              </li>
            );
          }
        )}
      </SidebarList>
    </Box>
  );
};

export default TypeFilter;
