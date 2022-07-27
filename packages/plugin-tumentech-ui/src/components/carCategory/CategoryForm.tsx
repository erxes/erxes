import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  generateCategoryOptions,
  MainStyleModalFooter as ModalFooter
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import Select from 'react-select-plus';

import { COLLAPSE_CONTENT_SELECTOR } from '../../constants';
import { ICarCategory } from '../../types';

type Props = {
  category?: ICarCategory;
  carCategories: ICarCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  collapseContent?: string[];
};

class CategoryForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { category = {} } = props;

    this.state = {
      collapseContent: category.collapseContent || []
    };
  }

  onCollapseContentChange = options => {
    const collapseContent = options.map(option => option.value);
    this.setState({ collapseContent });
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, category, carCategories } = this.props;
    const { values, isSubmitted } = formProps;
    const { collapseContent } = this.state;

    const object = category || ({} as ICarCategory);

    if (category) {
      values._id = category._id;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            autoFocus={true}
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
            componentClass="textarea"
            rows={5}
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Parent Category</ControlLabel>

          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={object.parentId}
          >
            <option value="" />
            {generateCategoryOptions(carCategories, object._id, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Collapse Content</ControlLabel>

          <Select
            value={collapseContent}
            onChange={this.onCollapseContentChange}
            options={COLLAPSE_CONTENT_SELECTOR}
            clearable={false}
            multi={true}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'car category',
            values: { ...values, collapseContent },
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default CategoryForm;
