import { Button, Icon, ModalTrigger, Tip } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { CategoryForm } from '../../containers';
import { ICategory } from '../../types';
import { ActionButtons, CategoryItem } from './styles';

type Props = {
  topicIds: string,
  category: ICategory,
  articlesCount: number,
  remove: ( _id: string ) => void,
  isActive: boolean
};

class CategoryRow extends Component<Props> {
  private size;
  
  constructor(props: Props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    const { remove, category } = this.props;
    remove(category._id);
  }

  renderEditForm(props) {
    return <CategoryForm {...props} />;
  }

  renderEditAction() {
    const { category, topicIds } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger 
        size={this.size} 
        title="Edit" 
        trigger={editTrigger}
        content={(props) => {
          return this.renderEditForm({ ...props, category, topicIds })
        }}
      />
    );
  }

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
