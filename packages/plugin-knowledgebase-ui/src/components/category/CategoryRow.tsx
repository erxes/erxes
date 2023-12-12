import { ActionButtons } from '@erxes/ui-settings/src/styles';
import Button from '@erxes/ui/src/components/Button';
import CategoryForm from '../../containers/category/CategoryForm';
import { CategoryItem } from './styles';
import { ICategory } from '@erxes/ui-knowledgeBase/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  topicId: string;
  category: ICategory;
  remove: (categoryId: string) => void;
  isActive: boolean;
  isChild?: boolean;
  isParent?: boolean;
  queryParams?: any;
};

class CategoryRow extends React.Component<Props> {
  private size;

  remove = () => {
    const { remove, category } = this.props;
    remove(category._id);
  };

  renderEditForm(props) {
    return <CategoryForm queryParams={this.props.queryParams} {...props} />;
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
