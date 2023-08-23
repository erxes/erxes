import React, { useState } from 'react';
import { IFormProps, IButtonMutateProps } from '@erxes/ui/src/types';
import { ClearButton, SelectWrapper, UploadItems } from '../styles';
import { description, title } from '../utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import GenerateFields from './GenerateFields';
import Form from '@erxes/ui/src/components/form/Form';
import Uploader from '@erxes/ui/src/components/Uploader';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import Select from 'react-select-plus';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  renderButton: (props: IButtonMutateProps) => any;
  item?: any;
  closeModal?: () => void;
  fields: any[];
  unitList?: any[];
  departments: any[];
};

export default function PostForm(props: Props) {
  const item = props.item || {};
  const fields = props.fields;
  const unitList = props.unitList || [];

  const [attachments, setAttachment] = useState(item.attachments || []);
  const [images, setImage] = useState(item.images || []);
  const [customFieldsData, setCustomFieldsData] = useState(
    item.customFieldsData || []
  );
  const [departmentIds, setDepartmentIds] = useState(item?.departmentIds || []);
  const [branchIds, setBranchIds] = useState(item?.branchIds || []);
  const [unitId, setUnitId] = useState(item?.unitId || '');

  const onChangeDepartments = (option: any) => {
    setDepartmentIds(option);
  };

  const onChangeBranches = (option: any) => {
    setBranchIds(option);
  };

  const onChangeUnit = (option: any) => {
    setUnitId(option.value);
  };

  const renderClearButton = () => {
    if (unitId) {
      return (
        <ClearButton onClick={() => setUnitId('')}>
          <Icon icon="times" />
        </ClearButton>
      );
    }

    return null;
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        {title(formProps, item)}
        {description(formProps, item)}
        <SelectDepartments
          label="Choose department"
          name="departmentIds"
          initialValue={departmentIds}
          onSelect={onChangeDepartments}
          multi={true}
        />
        <SelectBranches
          name="branchIds"
          label="Choose Branches"
          multi={true}
          initialValue={branchIds}
          onSelect={onChangeBranches}
        />
        <SelectWrapper>
          <Select
            name={'unitId'}
            multi={false}
            placeholder={'Choose Unit'}
            value={unitId}
            onChange={onChangeUnit}
            options={unitList.map(unit => ({
              value: unit._id,
              label: unit.title
            }))}
          />
          {renderClearButton()}
        </SelectWrapper>
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
            departmentIds,
            branchIds,
            unitId
          },
          isSubmitted,
          callback: closeModal
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
