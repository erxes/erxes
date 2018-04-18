import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tip, Button, Icon, ModalTrigger } from 'modules/common/components';
import { CategoryForm } from '../../containers';
import { CategoryItem, ActionButtons, CountArticle } from '../../styles';

const propTypes = {
  topicIds: PropTypes.string,
  category: PropTypes.object.isRequired,
  articlesCount: PropTypes.number.isRequired,
  remove: PropTypes.func.isRequired,
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
    const { category, topicIds } = this.props;
    const { __ } = this.context;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ category, topicIds })}
      </ModalTrigger>
    );
  }

  render() {
    const { category, isActive } = this.props;
    const { __ } = this.context;

    return (
      <CategoryItem key={category._id} isActive={isActive}>
        <Link to={`?id=${category._id}`}>{category.title}</Link>
        <CountArticle>{category.articles.length}</CountArticle>
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

CategoryRow.propTypes = propTypes;
CategoryRow.contextTypes = {
  __: PropTypes.func
};

export default CategoryRow;
