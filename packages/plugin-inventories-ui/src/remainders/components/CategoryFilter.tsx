import React from 'react';
import { useHistory } from 'react-router-dom';
import { __, Box, Icon, router } from '@erxes/ui/src';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';

type Props = {
  categories: any[];
  loading: boolean;
};

const CategoryFilter = (props: Props) => {
  const { categories = [] } = props;
  const history = useHistory();
  const paramKey = 'categoryId';

  const handleClear = () => {
    router.setParams(history, { categoryId: null });
  };

  const handleOnClick = (key: string, value: string) => {
    router.setParams(history, { [key]: value });
  };

  const extraButtons = router.getParam(history, 'categoryId') && (
    <a href="#cancel" tabIndex={0} onClick={handleClear}>
      <Icon icon="cancel-1" />
    </a>
  );

  return (
    <Box
      extraButtons={extraButtons}
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
                onClick={handleOnClick.bind(this, paramKey, item._id)}
              >
                <FieldStyle>{item.name}</FieldStyle>
              </a>
            </li>
          );
        })}
      </SidebarList>
    </Box>
  );
};

export default CategoryFilter;
