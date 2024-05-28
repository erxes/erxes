import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import Icon from '@erxes/ui/src/components/Icon';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Form from '../containers/Form';

type Props = {
  item: any;
  remove: (_id: any) => void;
  refetch: () => void;
};

function Item({ item, remove, refetch }: Props) {
  const trigger = (
    <Button id="skill-edit-skill" btnStyle="link">
      <Tip text={__('Edit')} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const content = formProps => {
    return (
      <React.Fragment>
        <Form item={item} refetch={refetch} {...formProps} />
      </React.Fragment>
    );
  };

  const removeItem = () => {
    remove(item._id);
  };

  const type = item.type;
  let typeTitle;
  switch (type) {
    case 'kindergarden':
      typeTitle = 'Цэцэрлэг';
      break;
    case 'school':
      typeTitle = 'Сургууль';
      break;
    case 'university':
      typeTitle = 'Их дээд сургууль';
      break;
    case 'soh':
      typeTitle = 'СӨХ';
      break;
    case 'khoroo':
      typeTitle = 'Хороо';
      break;
    case 'hospital':
      typeTitle = 'Өрхийн эмнэлэг';
      break;
    case 'busStop':
      typeTitle = 'Автобусны буудал';
      break;
    case 'parking':
      typeTitle = 'Зогсоол';
      break;
    case 'pharmacy':
      typeTitle = 'Эмийн сан';
      break;
    case 'districtTown':
      typeTitle = 'Дүүргийн байрны мэдээлэл';
      break;
  }

  return (
    <tr key={item._id}>
      <td>{item.name}</td>
      <td>{typeTitle}</td>
      <td>
        <ActionButtons>
          <ModalTrigger title={typeTitle} trigger={trigger} content={content} />
          <Tip text={__('Delete')} placement="bottom">
            <Button btnStyle="link" onClick={removeItem}>
              <Icon icon="times-circle" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
      <td style={{ width: 80 }} />
    </tr>
  );
}
export default Item;
