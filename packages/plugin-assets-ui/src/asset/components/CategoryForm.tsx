import { Button, FormControl, Uploader, __ } from '@erxes/ui/src';
import { CommonFormGroup, SelectWithAssetCategory } from '../../common/utils';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IAssetCategory, IAssetCategoryTypes } from '../../common/types';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';

import { ASSET_CATEGORY_STATUSES } from '../../common/constant';
import CommonForm from '@erxes/ui/src/components/form/Form';
import React from 'react';
import Select from 'react-select-plus';
import { extractAttachment } from '@erxes/ui/src/utils/core';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  category: IAssetCategoryTypes;
  categories: IAssetCategoryTypes[];
};

function CategoryForm({
  renderButton,
  closeModal,
  category,
  categories
}: Props) {
  const [attachment, setAttachment] = React.useState<IAttachment | undefined>(
    undefined
  );
  const [status, setStatus] = React.useState<string>('');
  const [parentId, setParentId] = React.useState<string>('');

  React.useEffect(() => {
    if (category) {
      setStatus(category.status || '');
      setParentId(category.parentId || '');
    }
  }, []);

  const generateDocs = values => {
    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    return { ...finalValues, attachment, status, parentId };
  };

  const onChangeAttachment = (files: IAttachment[]) => {
    const file = files ? files[0] : undefined;
    setAttachment(file);
  };

  const renderForm = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    const object = category || ({} as IAssetCategory);

    const attachments =
      (object.attachment && extractAttachment([object.attachment])) || [];

    return (
      <>
        <CommonFormGroup required={true} label="Name">
          <FormControl
            name="name"
            {...formProps}
            type="text"
            defaultValue={object.name}
            required={true}
          />
        </CommonFormGroup>
        <CommonFormGroup required={true} label="Code">
          <FormControl
            name="code"
            {...formProps}
            type="text"
            defaultValue={object.code}
            required={true}
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
              <Select
                placeholder={__('Choose status')}
                value={status}
                options={ASSET_CATEGORY_STATUSES}
                onChange={option => setStatus(option.value)}
                {...formProps}
              />
            </CommonFormGroup>
          </FormColumn>
          <FormColumn>
            <CommonFormGroup label="Parent Category">
              <SelectWithAssetCategory
                label="Choose Asset Category"
                name="categoryId"
                multi={false}
                initialValue={object.parentId}
                onSelect={value => setParentId(value as string)}
                customOption={{ value: '', label: 'Choose Asset Category' }}
                {...formProps}
              />
            </CommonFormGroup>
          </FormColumn>
        </FormWrapper>

        <CommonFormGroup label="Image">
          <Uploader
            onChange={onChangeAttachment}
            defaultFileList={attachments}
            multiple={false}
            single={false}
          />
        </CommonFormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            Cancel
          </Button>

          {renderButton({
            text: 'Asset Category',
            values: generateDocs(values),
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderForm} />;
}

export default CategoryForm;
