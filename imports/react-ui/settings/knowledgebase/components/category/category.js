import React, { Component, PropTypes } from 'react';
import Select from 'react-select-plus';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';

class KbCategory extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      selectedArticles: this.getSelectedArticles(),
    };
  }

  getSelectedArticles() {
    const { item } = this.props;
    return (item && item.articleIds) || [];
  }

  getArticles() {
    const results = [];

    const { articles } = this.props;

    results.push({
      label: 'Articles',
      options: articles.map(article => ({
        label: article.title,
        value: article._id,
      })),
    });
    return results;
  }

  render() {
    const item = this.props.item || {};

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="knowledgebase-category-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={item.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-category-description">
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" defaultValue={item.description} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Categories</ControlLabel>

          <Select
            placeholder="Choose articles"
            onChange={items => {
              this.setState({ selectedArticles: items });
            }}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            value={this.state.selectedArticles}
            options={this.getArticles()}
            multi
          />
        </FormGroup>

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    let articleIds = [];

    for (var i = 0; i < this.state.selectedArticles.length; i++) {
      articleIds.push(this.state.selectedArticles[i].value);
    }

    this.context.closeModal();

    this.props.save({
      title: document.getElementById('knowledgebase-category-title').value,
      description: document.getElementById('knowledgebase-category-description').value,
      articleIds: articleIds,
    });
  }
}

KbCategory.propTypes = {
  ...KbCategory.propTypes,
  articles: PropTypes.array.isRequired, // eslint-disable-line
};

KbCategory.contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default KbCategory;
