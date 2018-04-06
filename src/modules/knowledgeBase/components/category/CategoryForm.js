import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'modules/common/components';
import Ionicons from 'react-ionicons';
import { icons } from '../../icons.constant';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  currentTopicId: PropTypes.string,
  category: PropTypes.object,
  save: PropTypes.func
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CategoryForm extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedIcon: this.getSelectedIcon()
    };

    this.renderOption = this.renderOption.bind(this);
    this.onChangeIcon = this.onChangeIcon.bind(this);
    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => {
        this.context.closeModal();
      },
      this.props.category
    );
  }

  getSelectedIcon() {
    const { category } = this.props;
    return (category && category.icon) || '';
  }

  onChangeIcon(obj) {
    this.setState({
      selectedIcon: obj.value
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
    const { category, currentTopicId } = this.props;

    return {
      ...category,
      doc: {
        doc: {
          title: document.getElementById('knowledgebase-category-title').value,
          description: document.getElementById(
            'knowledgebase-category-description'
          ).value,
          icon: this.state.selectedIcon,
          topicIds: [currentTopicId]
        }
      }
    };
  }

  renderContent(category = {}) {
    return (
      <div>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="knowledgebase-category-title"
            type="text"
            defaultValue={category.title}
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="knowledgebase-category-description"
            type="text"
            defaultValue={category.description}
          />
        </FormGroup>

        <FormGroup>
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

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent(this.props.category || {})}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onClick}
            icon="close"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

CategoryForm.propTypes = propTypes;
CategoryForm.contextTypes = contextTypes;

export default CategoryForm;
