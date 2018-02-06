import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tip, Button, Icon, ModalTrigger } from 'modules/common/components';
import { CategoryForm } from './';
import { ArticleWrap, ActionButtons, CountArticle } from '../../styles';

const propTypes = {
  category: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  isActive: PropTypes.bool
};

class CategoryRow extends Component {
  constructor(props) {
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
    const { category, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ category, save })}
      </ModalTrigger>
    );
  }

  render() {
    const { category, isActive } = this.props;

    return (
      <ArticleWrap key={category._id} isActive={isActive}>
        <Link to={`?id=${category._id}`}>{category.title}</Link>
        <CountArticle>{category.articles.length}</CountArticle>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete">
            <Button btnStyle="link" onClick={this.remove} icon="close" />
          </Tip>
        </ActionButtons>
      </ArticleWrap>
    );
  }
}

CategoryRow.propTypes = propTypes;

export default CategoryRow;
