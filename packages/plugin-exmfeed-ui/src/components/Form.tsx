import React, { useState } from 'react';
import Select from 'react-select-plus';
import { IFormProps, IButtonMutateProps } from '@erxes/ui/src/types';
import { UploadItems } from '../styles';
import { description, getDepartmentOptions, title } from '../utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import GenerateFields from './GenerateFields';
import Form from '@erxes/ui/src/components/form/Form';
import Uploader from '@erxes/ui/src/components/Uploader';

type Props = {
  renderButton: (props: IButtonMutateProps) => any;
  item?: any;
  closeModal?: () => void;
  fields: any[];
  departments: any[];
};

export default function PostForm(props: Props) {
  const item = props.item || {};
  const fields = props.fields;
  const departments = props.departments || {};

  const [attachments, setAttachment] = useState(item.attachments || []);
  const [images, setImage] = useState(item.images || []);
  const [customFieldsData, setCustomFieldsData] = useState(
    item.customFieldsData || []
  );
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const onChangeDepartment = (option: any) => {
    setSelectedDepartment(option);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        {title(formProps, item)}
        {description(formProps, item)}
        <Select
          placeholder="Choose one department"
          name="departmentId"
          value={selectedDepartment}
          onChange={onChangeDepartment}
          multi={false}
          options={getDepartmentOptions(departments)}
        />
        <GenerateFields
          fields={fields}
          customFieldsData={customFieldsData}
          setCustomFieldsData={setCustomFieldsData}
        />
        <UploadItems>
          <div>
            <Uploader
              defaultFileList={attachments || []}
              onChange={setAttachment}
            />
            <ControlLabel>Add attachments:</ControlLabel>
          </div>
          <div>
            <Uploader defaultFileList={images || []} onChange={setImage} />
            <ControlLabel>Add image:</ControlLabel>
          </div>
        </UploadItems>

        {renderButton({
          values: {
            title: values.title,
            description: values.description ? values.description : null,
            contentType: 'post',
            images,
            attachments,
            customFieldsData,
            department: selectedDepartment ? selectedDepartment.label : null
          },
          isSubmitted,
          callback: closeModal
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
