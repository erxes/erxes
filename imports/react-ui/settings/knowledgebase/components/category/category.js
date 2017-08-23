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
import Ionicons from 'react-ionicons';
import { icons } from '../../icons.constant';

class KbCategory extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      selectedArticles: this.getSelectedArticles(),
      selectedIcon: this.getSelectedIcon(),
    };
    this.onChangeIcon = this.onChangeIcon.bind(this);
    this.renderOption = this.renderOption.bind(this);
  }

  getSelectedArticles() {
    const { item } = this.props;
    return (item && item.articleIds) || [];
  }

  getSelectedIcon() {
    const { item } = this.props;
    return (item && item.icon) || 'testIcon';
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

  onChangeIcon(obj) {
    this.setState({
      selectedIcon: obj.value,
    });
  }

  renderOption(option) {
    return (
      <div className="icon-option">
        <Ionicons icon={option.value} />
        {option.label}
      </div>
    );
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
          <ControlLabel>Articles</ControlLabel>

          <Select
            placeholder="Choose articles"
            onChange={items => {
              this.setState({ selectedArticles: items });
            }}
            optionRenderer={option =>
              <div className="simple-option">
                <span>
                  {option.label}
                </span>
              </div>}
            value={this.state.selectedArticles}
            options={this.getArticles()}
            multi
          />
        </FormGroup>

        <FormGroup controlId="knowledgebase-category-icon">
          <ControlLabel>Icon</ControlLabel>
          <Select
            name="form-field-name"
            value={this.state.selectedIcon}
            options={icons}
            onChange={this.onChangeIcon}
            optionRenderer={this.renderOption}
            valueRenderer={this.renderOption}
          />
        </FormGroup>

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">
              Save
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    let articleIds = [];

    for (var i = 0; i < this.state.selectedArticles.length; i++) {
      articleIds.push(this.state.selectedArticles[i].value || this.state.selectedArticles[i]);
    }

    this.context.closeModal();

    this.props.save({
      title: document.getElementById('knowledgebase-category-title').value,
      description: document.getElementById('knowledgebase-category-description').value,
      articleIds: articleIds,
      icon: this.state.selectedIcon,
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
