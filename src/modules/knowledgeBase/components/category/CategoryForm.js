import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Icon
} from 'modules/common/components';
import { icons } from '../../icons.constant';
import { ModalFooter } from 'modules/common/styles/main';

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

  save(doc) {
    this.props.save(
      this.generateDoc(doc),
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

  generateDoc(doc) {
    const { category, currentTopicId } = this.props;

    return {
      ...category,
      doc: {
        doc: {
          title: doc.knowledgebaseCategoryTitle,
          description: doc.knowledgebaseCategoryDescription,
          icon: this.state.selectedIcon,
          topicIds: [currentTopicId]
        }
      }
    };
  }

  renderContent(category = {}) {
    return (
      <Fragment>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            name="knowledgebaseCategoryTitle"
            type="text"
            value={category.title}
            validations="isValue"
            validationError="Please select a title"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            name="knowledgebaseCategoryDescription"
            type="text"
            value={category.description}
            validations="isValue"
            validationError="Please enter a description"
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
      </Fragment>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <Form onSubmit={this.save}>
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
      </Form>
    );
  }
}

CategoryForm.propTypes = propTypes;
CategoryForm.contextTypes = contextTypes;

export default CategoryForm;
