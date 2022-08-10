import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';
import CategoryForm from '../../containers/category/CategoryForm';
import { ICategory } from '@erxes/ui-knowledgeBase/src/types';
import { CategoryItem } from './styles';
import { ActionButtons } from '@erxes/ui-settings/src/styles';

type Props = {
  topicId: string;
  category: ICategory;
  articlesCount: number;
  remove: (categoryId: string) => void;
  isActive: boolean;
  isChild?: boolean;
  isParent?: boolean;
};

class CategoryRow extends React.Component<Props> {
  private size;

  remove = () => {
    const { remove, category } = this.props;
    remove(category._id);
  };

  renderEditForm(props) {
    return <CategoryForm {...props} />;
  }

  renderEditAction = () => {
    const { category, topicId } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => {
      return this.renderEditForm({ ...props, category, topicId });
    };

    return (
      <ModalTrigger
        size={this.size}
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  render() {
    const { category, isActive, isChild, isParent } = this.props;

    return (
      <CategoryItem key={category._id} isActive={isActive} isChild={isChild}>
        <Link to={`?id=${category._id}`}>
          <div>
            {category.title}
            <span>({category.articles.length})</span>
          </div>
          {isParent && <Icon icon="angle-down" />}
        </Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text={__('Delete')} placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </CategoryItem>
    );
  }
}

export default CategoryRow;
