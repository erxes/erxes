import React from 'react';
import { useHistory } from 'react-router-dom';
// erxes
import { __, router } from '@erxes/ui/src/utils/core';
import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';

type Props = {
  categories: any[];
  loading: boolean;
};

export default function CategoryFilter(props: Props) {
  const { categories = [] } = props;
  const history = useHistory();
  const paramKey = 'categoryId';

  const handleClear = () => {
    router.setParams(history, { categoryId: null });
  };

  const handleOnClick = (key: string, value: string) => {
    router.setParams(history, { [key]: value });
  };

  const renderExtraButtons = () =>
    router.getParam(history, 'categoryId') && (
      <a href="#cancel" tabIndex={0} onClick={handleClear}>
        <Icon icon="cancel-1" />
      </a>
    );

  return (
    <Box
      extraButtons={renderExtraButtons()}
      title={__('Filter by category')}
      name="showFilterByCategory"
      isOpen={true}
    >
      <SidebarList>
        {categories.map((item: any, index: number) => {
          return (
            <li key={index}>
              <a
                href="#filter"
                tabIndex={0}
                className={
                  router.getParam(history, [paramKey]) === item._id
                    ? 'active'
                    : ''
                }
                onClick={() => handleOnClick(paramKey, item._id)}
              >
                <FieldStyle>{item.name}</FieldStyle>
              </a>
            </li>
          );
        })}
      </SidebarList>
    </Box>
  );
}
