import React from 'react';
import { IMenu } from '../types';
import { __ } from '@erxes/ui/src/utils';
import { Link } from 'react-router-dom';
import { FormControl } from '@erxes/ui/src/components/form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ActionButtons, Button, Icon, Tip } from '@erxes/ui/src';

type Props = {
  menu: IMenu;
  isChecked: boolean;
  toggleBulk: (menu: IMenu, isChecked?: boolean) => void;
  remove: (menuId: string) => void;
};

const Row: React.FC<Props> = (props) => {
  const { menu, isChecked, toggleBulk, remove } = props;

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(menu, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onRemove = () => {
    remove(menu._id);
  };

  return (
    <tr>
      <td id="menusCheckBox" onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{menu.label}</td>
      <td>{menu.url || '-'}</td>
      <td>{menu.order || '-'}</td>
      <td>
        {menu.target === '_blank' ? 'New Tab' : 'Same Tab'}
      </td>
      <td>
        <ActionButtons>
          <Tip text={__('Edit')} placement="top">
            <Link to={`/cms/menus/edit/${menu._id}`}>
              <Button btnStyle="link" icon="edit" />
            </Link>
          </Tip>
          <Tip text={__('Delete')} placement="top">
            <Button
              btnStyle="link"
              onClick={onRemove}
              icon="times-circle"
            />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
