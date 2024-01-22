import React from 'react';

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
};

class Row extends React.Component<Props> {
  render() {
    const { item, history, isChecked } = this.props;

    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const onClick = (e) => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      history.push(`/settings/items/details/${item._id}`);
    };

    const content = (props) => <>hi</>;

    const { code, name, description } = item;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl checked={isChecked} componentClass="checkbox" />
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
}

export default Row;
