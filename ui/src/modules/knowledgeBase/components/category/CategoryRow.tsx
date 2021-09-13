import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import CategoryForm from '../../containers/category/CategoryForm';
import { ICategory } from '../../types';
import { ActionButtons, CategoryItem } from './styles';

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
