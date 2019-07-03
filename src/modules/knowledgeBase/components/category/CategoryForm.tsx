import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import Select from 'react-select-plus';
import { icons } from '../../icons.constant';
import { ICategory } from '../../types';

type Props = {
  currentTopicId: string;
  category: ICategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  selectedIcon: string;
};

class CategoryForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedIcon: this.getSelectedIcon()
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
    const { category, currentTopicId } = this.props;
    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        title: finalValues.title,
        description: finalValues.description,
        icon: this.state.selectedIcon,
        topicIds: [currentTopicId]
      }
    };
  };

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
            isRequired={true}
            name="form-field-name"
            value={this.state.selectedIcon}
            options={icons}
            onChange={this.onChangeIcon}
            optionRenderer={this.renderOption}
            valueRenderer={this.renderOption}
          />
        </FormGroup>
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
