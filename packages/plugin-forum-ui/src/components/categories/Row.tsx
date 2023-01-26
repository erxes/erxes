import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import { ICategory } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import CategoryForm from '../../components/CategoryForm';
import RowContainer from '../../containers/categories/Row';
import { IButtonMutateProps } from '@erxes/ui/src/types';

export const TdWrapper = styledTS<{ space: number }>(styled.td)`
  padding: ${props => props.space * 3};
`;

type Props = {
  categories: ICategory[];
  parentCategory: ICategory;
  onDelete?: (val: any) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
    const { categories, parentCategory, onDelete, renderButton } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = props => (
      <CategoryForm
        {...props}
        key={parentCategory._id}
        category={parentCategory}
        renderButton={renderButton}
      />
    );

    return (
      <>
        <tr>
          <td
            style={{
              padding:
                parentCategory.ancestors &&
                `0 0 0 ${parentCategory.ancestors.length * 3}em`,
              margin: 0
            }}
          >
            {parentCategory.name}
          </td>
          <td>{parentCategory.code}</td>
          <td>{parentCategory.postsCount}</td>
          <td>
            <ActionButtons>
              <ModalTrigger
                title="Edit Category"
                trigger={editTrigger}
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
        {categories.map((cat: any, index: number) => {
          return <RowContainer category={cat} key={index} />;
        })}
      </>
    );
  }
}

export default Row;
