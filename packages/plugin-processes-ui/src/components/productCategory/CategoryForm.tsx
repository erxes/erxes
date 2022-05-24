import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Uploader from '@erxes/ui/src/components/Uploader';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import {
  extractAttachment,
  generateCategoryOptions
} from '@erxes/ui/src/utils';
import { IJobCategory } from '../../types';
import { PRODUCT_CATEGORY_STATUSES } from '../../constants';
import { ICategory } from '@erxes/ui/src/utils/categories';

type Props = {
  categories: IJobCategory[];
  category?: IJobCategory;
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
    const attachment = category.attachment ? category.attachment : undefined;

    console.log('constructor ...');

    this.state = {
      attachment
    };
  }

  generateDoc = (values: { _id?: string; attachment?: IAttachment }) => {
    const { category } = this.props;
    const finalValues = values;
    const attachment = this.state.attachment
      ? this.state.attachment
      : undefined;

    if (category) {
      finalValues._id = category._id;
    }

    return {
      ...finalValues,
      attachment
    };
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ attachment: files ? files[0] : undefined });
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, category, categories } = this.props;
    const { values, isSubmitted } = formProps;
    const object = category || ({} as IJobCategory);

    const attachments =
      (object.attachment && extractAttachment([object.attachment])) || [];

    console.log('attachments here', attachments);

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

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>State</ControlLabel>

              <FormControl
                {...formProps}
                name="status"
                componentClass="select"
                defaultValue={object.status}
                options={PRODUCT_CATEGORY_STATUSES}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>

              <Uploader
                defaultFileList={attachments}
                onChange={this.onChangeAttachment}
                multiple={false}
                single={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <FormGroup>
          <ControlLabel>Parent Category</ControlLabel>

          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={object.parentId}
          >
            <option value="" />
            {categories.map(categoryMap => (
              <option key={categoryMap._id} value={categoryMap._id}>
                {categoryMap.name}
              </option>
            ))}
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
            name: 'job & category',
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
