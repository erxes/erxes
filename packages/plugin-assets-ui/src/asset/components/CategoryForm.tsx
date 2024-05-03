import { CommonFormGroup, SelectWithAssetCategory } from '../../common/utils';
import { FormColumn } from '@erxes/ui/src/styles/main';
import { FormWrapper } from '@erxes/ui/src/styles/main';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IAssetCategory, IAssetCategoryTypes } from '../../common/types';
import { IAttachment } from '@erxes/ui/src/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IFormProps } from '@erxes/ui/src/types';
import { ASSET_CATEGORY_STATUSES } from '../../common/constant';
import CommonForm from '@erxes/ui/src/components/form/Form';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { extractAttachment } from '@erxes/ui/src/utils/core';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import Uploader from '@erxes/ui/src/components/Uploader';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  category: IAssetCategoryTypes;
  categories: IAssetCategoryTypes[];
};

const CategoryForm = (props: Props) => {
  const { renderButton, closeModal, category } = props;

  const [attachment, setAttachment] = useState<IAttachment | undefined>(
    undefined
  );
  const [status, setStatus] = useState<string>("");
  const [parentId, setParentId] = useState<string>("");

  useEffect(() => {
    if (category) {
      setStatus(category.status || "");
      setParentId(category.parentId || "");
    }
  }, []);

  const generateDocs = (values) => {
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
            componentclass="textarea"
            defaultValue={object.description}
          />
        </CommonFormGroup>

        <FormWrapper>
          <FormColumn>
            <CommonFormGroup label="Status" required={true}>
              <Select
                placeholder={__('Choose status')}
                value={ASSET_CATEGORY_STATUSES.find(o=>o.value ===status)}
                options={ASSET_CATEGORY_STATUSES}
                onChange={(option: any) => setStatus(option.value)}
                isClearable={false}
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
                onSelect={(value) => setParentId(value as string)}
                customOption={{ value: "", label: "Choose Asset Category" }}
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
            single={true}
          />
        </CommonFormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            Cancel
          </Button>

          {renderButton({
            text: "Asset Category",
            values: generateDocs(values),
            isSubmitted,
            callback: closeModal,
            object: category,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderForm} />;
};

export default CategoryForm;
