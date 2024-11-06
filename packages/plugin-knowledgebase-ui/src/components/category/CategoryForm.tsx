import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { ICategory, ITopic } from "@erxes/ui-knowledgeBase/src/types";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import React from "react";
import Select from "react-select";
import { __ } from "@erxes/ui/src/utils/core";
import { icons } from "../../icons.constant";

type Props = {
  currentTopicId: string;
  category: ICategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  topics: ITopic[];
  queryParams: any;
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
      parentCategoryId: category && category.parentCategoryId,
    };
  }

  getSelectedIcon() {
    const { category } = this.props;

    return category ? category.icon : "";
  }

  onChangeIcon = (obj) => {
    this.setState({
      selectedIcon: obj ? obj.value : "",
    });
  };

  renderOption = (option) => {
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
    code?: string;
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
        parentCategoryId,
        code: finalValues.code,
      },
    };
  };

  generateOptions = (values: any, selectable?: boolean) => {
    const options = selectable
      ? [
          {
            value: null,
            label: __("Select category"),
          },
        ]
      : [];

    values.forEach((option) =>
      options.push({
        value: option._id,
        label: option.title,
      })
    );

    return options;
  };

  renderTopics() {
    const self = this;
    const { topics } = this.props;

    const onChange = (selectedTopic) => {
      self.setState({ topicId: selectedTopic.value, parentCategoryId: "" });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the knowledgebase</ControlLabel>
        <br />

        <Select
          placeholder={__("Choose knowledgebase")}
          value={this.generateOptions(topics).find(
            (o) => o.value === this.state.topicId
          )}
          options={this.generateOptions(topics)}
          isClearable={true}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderParentCategories() {
    const { topics } = this.props;
    const self = this;
    const topic = topics.find((t) => t._id === self.state.topicId);
    let categories = topic ? topic.parentCategories : [];
    const { category, currentTopicId } = self.props;

    if (category && currentTopicId === this.state.topicId) {
      categories = categories.filter((cat) => cat._id !== category._id);
    }

    const onChange = (selectedCategory) => {
      self.setState({ parentCategoryId: selectedCategory.value });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the parent category</ControlLabel>
        <br />

        <Select
          placeholder={__("Choose category")}
          value={this.generateOptions(categories, true).find(
            (o) => o.value === this.state.parentCategoryId
          )}
          options={this.generateOptions(categories, true)}
          onChange={onChange}
          isClearable={false}
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
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.code}
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
            value={icons.find((o) => o.value === this.state.selectedIcon)}
            options={icons}
            onChange={this.onChangeIcon}
            // components={{ Option, SingleValue }}
          />
        </FormGroup>

        {this.renderTopics()}
        {this.renderParentCategories()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          {renderButton({
            name: "category",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: category,
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
