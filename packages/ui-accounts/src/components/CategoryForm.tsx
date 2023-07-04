import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { generateCategoryOptions } from '@erxes/ui/src/utils';
import { IAccountCategory } from '../types';
import { ICategory } from '@erxes/ui/src/utils/categories';

type Props = {
  categories: IAccountCategory[];
  category?: IAccountCategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  attachment?: IAttachment;
};

class CategoryForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const category = props.category || ({} as ICategory);
    const attachment = category.attachment || undefined;

    this.state = {
      attachment
    };
  }

  generateDoc = (values: { _id?: string; attachment?: IAttachment }) => {
    const { category } = this.props;
    const finalValues = values;
    const { attachment } = this.state;

    if (category) {
      finalValues._id = category._id;
    }

    return {
      ...finalValues,
      attachment
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, category, categories } = this.props;
    const { values, isSubmitted } = formProps;
    const object = category || ({} as IAccountCategory);

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
          <ControlLabel>Parent Category</ControlLabel>

          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={object.parentId}
          >
            <option value="" />
            {generateCategoryOptions(categories, object._id)}
          </FormControl>
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
            name: 'account category',
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
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default CategoryForm;
