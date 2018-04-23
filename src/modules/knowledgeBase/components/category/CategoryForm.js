import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Icon
} from 'modules/common/components';
import { icons } from '../../icons.constant';
import { ModalFooter } from 'modules/common/styles/styles';
import { Alert } from 'modules/common/utils';

const propTypes = {
  currentTopicId: PropTypes.string,
  category: PropTypes.object,
  save: PropTypes.func
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
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

    const { __ } = this.context;
    const fields = this.generateDoc();

    if (!fields.doc.doc.description)
      return Alert.error(__('Write description'));
    if (!fields.doc.doc.icon) return Alert.error(__('Choose icon'));

    this.props.save(
      fields,
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
        <Icon icon={option.value} />
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
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
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
