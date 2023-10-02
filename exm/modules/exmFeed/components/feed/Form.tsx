import {
  AdditionalInfo,
  AdditionalItem,
  CreateFormContainer,
  CreateInput,
  FlexRow,
  UploadItems
} from '../../styles';
import { Form, FormGroup } from '../../../common/form';
import { IButtonMutateProps, IFormProps } from '../../../common/types';
import React, { useState } from 'react';
import { description, getDepartmentOptions, title } from '../../utils';

import ControlLabel from '../../../common/form/Label';
import GenerateFields from '../GenerateFields';
import Icon from '../../../common/Icon';
import ModalTrigger from '../../../common/ModalTrigger';
import NameCard from '../../../common/nameCard/NameCard';
import Select from 'react-select-plus';
import Uploader from '../../../common/Uploader';
import { __ } from '../../../../utils';
import { IUser } from '../../../auth/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => any;
  item?: any;
  closeModal?: () => void;
  fields: any[];
  departments: any[];
  branches: any[];
  units: any[];
  isEdit?: boolean;
  currentUser: IUser;
};

export default function PostForm(props: Props) {
  const item = props.item || {};
  const fields = props.fields;
  const departments = props.departments || [];
  const branches = props.branches || [];
  const units = props.units || [];

  const [attachments, setAttachment] = useState(item.attachments || []);
  const [images, setImage] = useState(item.images || []);
  const [customFieldsData, setCustomFieldsData] = useState(
    item.customFieldsData || []
  );
  const [departmentIds, setDepartmentIds] = useState(item?.departmentIds || []);
  const [branchIds, setBranchIds] = useState(item?.branchIds || []);
  const [unitId, setUnitId] = useState(item?.unitId || '');

  const onChangeDepartment = (option: any) => {
    setDepartmentIds(option.map((data) => data.value) || []);
  };

  const onChangeBranch = (option: any) => {
    setBranchIds(option.map((data) => data.value) || []);
  };

  const onChangeUnit = (option: any) => {
    setUnitId(option?.value || '');
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          {title(formProps, item)}
        </FormGroup>
        <FormGroup>
          <ControlLabel>Main Post</ControlLabel>
          {description(formProps, item)}
        </FormGroup>
        <FormGroup>
          <ControlLabel>Choose department</ControlLabel>
          <Select
            placeholder="Choose department"
            name="departmentIds"
            value={departmentIds}
            onChange={onChangeDepartment}
            multi={true}
            options={getDepartmentOptions(departments)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Choose branch</ControlLabel>
          <Select
            placeholder="Choose branch"
            name="branchIds"
            value={branchIds}
            onChange={onChangeBranch}
            multi={true}
            options={getDepartmentOptions(branches)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Choose unit</ControlLabel>
          <Select
            placeholder="Choose unit"
            name="unitId"
            value={unitId}
            onChange={onChangeUnit}
            multi={false}
            options={getDepartmentOptions(units)}
          />
        </FormGroup>
        {fields && fields.length !== 0 && (
          <FormGroup>
            <ControlLabel>Custom fields</ControlLabel>
            <GenerateFields
              fields={fields}
              customFieldsData={customFieldsData}
              setCustomFieldsData={setCustomFieldsData}
            />
          </FormGroup>
        )}
        <ControlLabel>Add to your post</ControlLabel>
        <UploadItems>
          <div>
            <Uploader
              defaultFileList={images || []}
              onChange={setImage}
              btnText="Cover Image"
              btnIcon="image"
              single={true}
              btnIconSize={30}
            />
          </div>
          <div>
            <Uploader
              defaultFileList={attachments || []}
              onChange={setAttachment}
              btnText="Attachments"
              btnIcon="files-landscapes-alt"
              btnIconSize={30}
            />
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
          callback: props.isEdit ? closeModal : insideCloseModal
        })}
      </>
    );
  };

  let insideCloseModal;
  const content = (datas?) => {
    insideCloseModal = datas ? datas.closeModal : props.closeModal;

    return <Form {...datas} renderContent={renderContent} />;
  };

  if (props.isEdit) {
    return content();
  }

  return (
    <CreateFormContainer>
      <FlexRow>
        <NameCard.Avatar user={props.currentUser} size={45} />
        <ModalTrigger
          dialogClassName="create-post"
          size="lg"
          title="Create post"
          trigger={<CreateInput>{__('What`s on your mind?')}</CreateInput>}
          content={content}
        />
      </FlexRow>
      <AdditionalInfo>
        <ModalTrigger
          dialogClassName="create-post"
          size="lg"
          title="Create post"
          trigger={
            <AdditionalItem>
              <Icon icon="picture" size={16} />
              <span>{__('Photo/video')}</span>
            </AdditionalItem>
          }
          content={content}
        />
      </AdditionalInfo>
    </CreateFormContainer>
  );
}
