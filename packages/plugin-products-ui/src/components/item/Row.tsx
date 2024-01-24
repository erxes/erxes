import React from 'react';
import Form from '../../containers/item/ItemForm';

import {
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __,
  ActionButtons,
} from '@erxes/ui/src';
import { IItem } from '../.././types';

type Props = {
  item: IItem;
  history: any;
  isChecked: boolean;
  toggleBulk: (item: IItem, isChecked?: boolean) => void;
};

function Row(props: Props) {
  const { item, history, toggleBulk, isChecked } = props;

  const trigger = (
    <Button btnStyle="link">
      <Tip text={__('Edit')} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(item, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    history.push(`/settings/items/details/${item._id}`);
  };

  const content = (props) => <Form {...props} item={item} />;

  const { code, name, description } = item;

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{code}</td>
      <td>{name}</td>
      <td>{description}</td>
      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit basic info"
            trigger={trigger}
            size="xl"
            content={content}
          />
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
