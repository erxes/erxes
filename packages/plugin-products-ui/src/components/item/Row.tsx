import Tags from '@erxes/ui/src/components/Tags';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import React from 'react';
import { IProduct } from '../../types';

import ProductForm from '@erxes/ui-products/src/containers/ProductForm';

import {
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __,
  ActionButtons,
} from '@erxes/ui/src';
import { IItem } from '@erxes/ui-products/src/types';

type Props = {
  item: IItem;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const { item } = this.props;

    const { code, name, description } = item;

    return (
      <tr>
        <td>
          <FormControl componentClass="checkbox" />
        </td>
        <td>{code}</td>
        <td>{name}</td>
        <td>{description}</td>
      </tr>
    );
  }
}

export default Row;
