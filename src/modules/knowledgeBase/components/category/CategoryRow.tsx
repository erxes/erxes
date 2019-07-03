import { Button, Icon, ModalTrigger, Tip } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryForm } from '../../containers';
import { ICategory } from '../../types';
import { ActionButtons, CategoryItem } from './styles';

type Props = {
  topicIds: string;
  category: ICategory;
  articlesCount: number;
  remove: (categoryId: string) => void;
  isActive: boolean;
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
    const { category, topicIds } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => {
      return this.renderEditForm({ ...props, category, topicIds });
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
    const { category, isActive } = this.props;

    return (
      <CategoryItem key={category._id} isActive={isActive}>
        <Link to={`?id=${category._id}`}>
          {category.title} <span>({category.articles.length})</span>
        </Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text={__('Delete')}>
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </CategoryItem>
    );
  }
}

export default CategoryRow;
