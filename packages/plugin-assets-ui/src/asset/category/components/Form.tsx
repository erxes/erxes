import { Button, FormControl, Uploader } from '@erxes/ui/src';
import CommonForm from '@erxes/ui/src/components/form/Form';
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
import { extractAttachment } from '@erxes/ui/src/utils/core';
import React from 'react';
import { ASSET_CATEGORY_STATUSES } from '../../../common/constant';
import { IAssetCategory, IAssetCategoryTypes } from '../../../common/types';
import {
  CommonFormGroup,
  generateCategoryOptions
} from '../../../common/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  category: IAssetCategoryTypes;
  categories: IAssetCategoryTypes[];
};

class Form extends React.Component<Props> {
  constructor(props) {
    super(props);

    const category = props.category || ({} as IAssetCategory);
    const attachment = category.attachment || undefined;
    this.state = {
      attachment
    };

    this.renderForm = this.renderForm.bind(this);
  }

  generateDocs(values) {
    const { category } = this.props;

    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    return { ...finalValues };
  }

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ attachment: files ? files[0] : undefined });
  };
  renderForm(formProps: IFormProps) {
    const { renderButton, closeModal, category, categories } = this.props;
    const { isSubmitted, values } = formProps;

    const object = category || ({} as IAssetCategory);

    const attachments =
      (object.attachment && extractAttachment([object.attachment])) || [];

    return (
      <>
        <CommonFormGroup label="Name">
          <FormControl
            name="name"
            {...formProps}
            type="text"
            defaultValue={object.name}
          />
        </CommonFormGroup>
        <CommonFormGroup label="Code">
          <FormControl
            name="code"
            {...formProps}
            type="text"
            defaultValue={object.code}
          />
        </CommonFormGroup>
        <CommonFormGroup label="Description">
          <FormControl
            name="description"
            {...formProps}
            componentClass="textarea"
            defaultValue={object.description}
          />
        </CommonFormGroup>

        <FormWrapper>
          <FormColumn>
            <CommonFormGroup label="Status">
              <FormControl
                name="status"
                {...formProps}
                componentClass="select"
                options={ASSET_CATEGORY_STATUSES}
                defaultValue={object.status}
              />
            </CommonFormGroup>
          </FormColumn>
          <FormColumn>
            <CommonFormGroup label="Image">
              <Uploader
                onChange={this.onChangeAttachment}
                defaultFileList={attachments}
                multiple={false}
                single={false}
              />
            </CommonFormGroup>
          </FormColumn>
        </FormWrapper>

        <CommonFormGroup label="Parent Category">
          <FormControl
            name="parentId"
            {...formProps}
            componentClass="select"
            defaultValue={object.parentId}
          >
            <option value="" />
            {generateCategoryOptions(categories, object._id)}
          </FormControl>
        </CommonFormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            Cancel
          </Button>

          {renderButton({
            text: 'Asset Category',
            values: this.generateDocs(values),
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderForm} />;
  }
}

export default Form;
