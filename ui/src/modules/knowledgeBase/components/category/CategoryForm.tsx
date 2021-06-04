import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import Select from 'react-select-plus';
import { icons } from '../../icons.constant';
import { ICategory, ITopic } from '../../types';
import { __ } from 'modules/common/utils';

type Props = {
  currentTopicId: string;
  category: ICategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  topics: ITopic[];
};

type State = {
  selectedIcon: string;
  topicId: string;
  parentCategoryId?: string;
};

class CategoryForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { category, currentTopicId } = props;

    this.state = {
      selectedIcon: this.getSelectedIcon(),
      topicId: currentTopicId,
      parentCategoryId: category && category.parentCategoryId
    };
  }

  getSelectedIcon() {
    const { category } = this.props;

    return category ? category.icon : '';
  }

  onChangeIcon = obj => {
    this.setState({
      selectedIcon: obj ? obj.value : ''
    });
  };

  renderOption = option => {
    return (
      <div className="icon-option">
        <Icon icon={option.value} />
        {option.label}
      </div>
    );
  };

  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
  }) => {
    const { category } = this.props;
    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    const { topicId, parentCategoryId, selectedIcon } = this.state;

    return {
      _id: finalValues._id,
      doc: {
        title: finalValues.title,
        description: finalValues.description,
        icon: selectedIcon,
        topicIds: [topicId],
        topicId,
        parentCategoryId
      }
    };
  };

  generateOptions = (values: any, selectable?: boolean) => {
    const options = selectable
      ? [
          {
            value: '',
            label: 'Select category'
          }
        ]
      : [];

    values.forEach(option =>
      options.push({
        value: option._id,
        label: option.title
      })
    );

    return options;
  };

  renderTopics() {
    const self = this;
    const { topics } = this.props;

    const onChange = selectedTopic => {
      self.setState({ topicId: selectedTopic.value, parentCategoryId: '' });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the knowledgebase</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose knowledgebase')}
          value={self.state.topicId}
          options={self.generateOptions(topics)}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderParentCategories() {
    const self = this;
    const topic = this.props.topics.find(t => t._id === self.state.topicId);
    let categories = topic ? topic.parentCategories : [];
    const { category, currentTopicId } = self.props;

    if (category && currentTopicId === this.state.topicId) {
      categories = categories.filter(cat => cat._id !== category._id);
    }

    const onChange = selectedCategory => {
      self.setState({ parentCategoryId: selectedCategory.value });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the parent category</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose category')}
          value={self.state.parentCategoryId}
          options={self.generateOptions(categories, true)}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { category, closeModal, renderButton } = this.props;
    const object = category || ({} as ICategory);
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Icon</ControlLabel>
          <Select
            required={true}
            value={this.state.selectedIcon}
            options={icons}
            onChange={this.onChangeIcon}
            optionRenderer={this.renderOption}
            valueRenderer={this.renderOption}
          />
        </FormGroup>

        {this.renderTopics()}
        {this.renderParentCategories()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          {renderButton({
            name: 'category',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default CategoryForm;
