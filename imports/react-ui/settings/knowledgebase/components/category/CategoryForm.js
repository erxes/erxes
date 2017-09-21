import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Form as CommonForm } from '/imports/react-ui/settings/common/components';
import Ionicons from 'react-ionicons';
import { icons } from '../../icons.constant';

const additionalPropTypes = {
  articles: PropTypes.array.isRequired,
};

class CategoryForm extends CommonForm {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedArticles: this.getSelectedArticles(),
      selectedIcon: this.getSelectedIcon(),
    };

    this.renderOption = this.renderOption.bind(this);
    this.onChangeIcon = this.onChangeIcon.bind(this);
  }

  getSelectedArticles() {
    const { object = {} } = this.props;

    return (object.articles || []).map(article => ({
      label: article.title,
      value: article._id,
    }));
  }

  getSelectedIcon() {
    const { object } = this.props;
    return (object && object.icon) || '';
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

  generateDoc() {
    const { object } = this.props;
    const articleIds = this.state.selectedArticles.map(article => article.value);

    return {
      ...object,
      doc: {
        title: document.getElementById('knowledgebase-category-title').value,
        description: document.getElementById('knowledgebase-category-description').value,
        articleIds,
        icon: this.state.selectedIcon,
      },
    };
  }

  renderContent(object = {}) {
    return (
      <div>
        <FormGroup controlId="knowledgebase-category-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={object.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-category-description">
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" defaultValue={object.description} />
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
      </div>
    );
  }
}

Object.assign(CategoryForm.propTypes, additionalPropTypes);

export default CategoryForm;
