import React from 'react';
import { IMenu } from '../types';
import { __, router } from '@erxes/ui/src/utils';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import { FormControl, Pagination, Table } from '@erxes/ui/src/components';
import { Title } from '@erxes/ui-settings/src/styles';
import Row from './Row';

type Props = {
  menus: IMenu[];
  totalCount: number;
  loading: boolean;
  remove: (menuId: string) => void;
  toggleBulk: (menu: IMenu, isChecked?: boolean) => void;
  toggleAll: (targets: IMenu[], isChecked: boolean) => void;
  isAllSelected: boolean;
  history: any;
  queryParams: any;
};

const List: React.FC<Props> = (props) => {
  const {
    menus,
    totalCount,
    loading,
    remove,
    toggleBulk,
    toggleAll,
    isAllSelected,
    history,
    queryParams
  } = props;

  const renderRow = () => {
    return menus.map((menu) => (
      <Row
        key={menu._id}
        menu={menu}
        isChecked={isAllSelected}
        toggleBulk={toggleBulk}
        remove={remove}
      />
    ));
  };

  const searchHandler = (e) => {
    const { value } = e.currentTarget as HTMLInputElement;

    router.setParams(history, { searchValue: value });
    router.setParams(history, { page: 1 });
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Menus')} />}
      actionBar={
        <BarItems>
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={searchHandler}
            value={router.getParam(history, 'searchValue')}
            autoFocus={true}
            onFocus={moveCursorAtTheEnd}
          />
        </BarItems>
      }
      footer={<Pagination count={totalCount} />}
      content={
        <Table hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={() => toggleAll(menus, !isAllSelected)}
                />
              </th>
              <th>{__('Label')}</th>
              <th>{__('URL')}</th>
              <th>{__('Order')}</th>
              <th>{__('Target')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default List;
