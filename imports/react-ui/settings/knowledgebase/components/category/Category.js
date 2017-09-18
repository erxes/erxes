import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

const propTypes = {
  item: PropTypes.object,
  articles: PropTypes.array.isRequired, // eslint-disable-line
  save: PropTypes.func.isRequired,
};

const contextPropTypes = {
  closeModal: PropTypes.func.isRequired,
};

class KbCategory extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedArticles: this.getSelectedArticles(),
      selectedIcon: this.getSelectedIcon(),
    };

    this.renderOption = this.renderOption.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeIcon = this.onChangeIcon.bind(this);
  }

  getSelectedArticles() {
    const { item } = this.props;

    return (item.articles || []).map(article => ({
      label: article.title,
      value: article._id,
    }));
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

  handleSubmit(e) {
    e.preventDefault();

    const articleIds = this.state.selectedArticles.map(article => article.value);
    const { item } = this.props;

    const newValues = {
      title: document.getElementById('knowledgebase-category-title').value,
      description: document.getElementById('knowledgebase-category-description').value,
      articleIds,
      icon: this.state.selectedIcon,
      createdBy: item.createdBy,
      modifiedBy: item.modifiedBy,
      createdDate: item.createdDate != null ? new Date(item.createdDate) : new Date(), // graphql mongoose driver returns
      modifiedDate: item.modifiedDate != null ? new Date(item.modifiedDate) : new Date(), // timestamp instead of Date object
    };
    this.props.save(newValues);
    this.context.closeModal();
  }

  render() {
    const { item = {} } = this.props;

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
            optionRenderer={option => (
              <div className="simple-option">
                <span>
                  {option.label}
                </span>
              </div>
            )}
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
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

KbCategory.propTypes = propTypes;

KbCategory.contextTypes = contextPropTypes;

export default KbCategory;
