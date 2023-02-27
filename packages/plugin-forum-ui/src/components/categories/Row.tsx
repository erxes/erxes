import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import CategoryForm from '../../containers/categories/CategoryForm';
import { ICategory } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import RowContainer from '../../containers/categories/Row';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';

type Props = {
  categories: ICategory[];
  parentCategory: ICategory;
  onDelete?: () => void;
};

type State = {
  showMerge: boolean;
  mergeDestination?: { value: string; label: string };
};
class Row extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { showMerge: false };
  }

  render() {
    const { categories, parentCategory, onDelete } = this.props;
    const {
      ancestors,
      name,
      code,
      postsCount,
      _id,
      description,
      order
    } = parentCategory;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = props => (
      <CategoryForm {...props} key={_id} category={parentCategory} />
    );

    return (
      <>
        <tr>
          <td
            style={{
              padding: ancestors && `0 0 0 ${ancestors.length * 3}em`,
              margin: 0
            }}
          >
            {name}
          </td>
          <td>{description}</td>
          <td>
            <Label lblStyle="simple">{code}</Label>
          </td>
          <td>{(postsCount || 0).toLocaleString()}</td>
          <td>{order}</td>
          <td>
            <ActionButtons>
              <ModalTrigger
                title="Edit Category"
                trigger={editTrigger}
                size="lg"
                content={content}
              />

              <Tip text={__('Delete')} placement="top">
                <Button
                  btnStyle="link"
                  onClick={onDelete}
                  icon="times-circle"
                />
              </Tip>
            </ActionButtons>
          </td>
        </tr>
        {(categories || []).map((cat: ICategory, index: number) => {
          return <RowContainer category={cat} key={index} />;
        })}
      </>
    );
  }
}

export default Row;
