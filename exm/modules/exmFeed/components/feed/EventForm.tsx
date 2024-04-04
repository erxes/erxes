import { CustomRangeContainer, UploadItems } from '../../styles';
import { IButtonMutateProps, IFormProps } from '../../../common/types';
import React, { useState } from 'react';
import { description, getDepartmentOptions, title } from '../../utils';

import ControlLabel from '../../../common/form/Label';
import DateControl from '../../../common/form/DateControl';
import { Form, FormGroup } from '../../../common/form';
import FormControl from '../../../common/form/Control';
import GenerateFields from '../GenerateFields';
import Select from 'react-select-plus';
import SelectTeamMembers from '../../../common/team/containers/SelectTeamMembers';
import Uploader from '../../../common/Uploader';
import { CreateFormContainer, CreateInput, FlexRow } from '../../styles';
import ModalTrigger from '../../../common/ModalTrigger';
import NameCard from '../../../common/nameCard/NameCard';
import { __ } from '../../../../utils';
import { IUser } from '../../../auth/types';

type Props = {
  item?: any;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => any;
  fields: any[];
  departments: any[];
  isEdit?: boolean;
  branches: any[];
  units: any[];
  currentUser: IUser;
};

export default function EventForm(props: Props) {
  const {
    item = {},
    fields,
    departments,
    branches,
    units,
    currentUser
  } = props;

  const [attachments, setAttachment] = useState(item.attachments || []);
  const [images, setImages] = useState(item.images || []);
  const [recipientIds, setRecipientIds] = useState(item.recipientIds || []);
  const [customFieldsData, setCustomFieldsData] = useState(
    item.customFieldsData || []
  );
  const itemEventData = item.eventData || {};

  const [eventData, setEventData] = useState({
    visibility: itemEventData.visibility || 'public',
    where: itemEventData.where || '',
    startDate: itemEventData.startDate,
    endDate: itemEventData.endDate
  });

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

  const onChangeEventData = (key, value) => {
    setEventData({ ...eventData, [key]: value });
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <FormGroup>
          <FormControl
            componentClass="radio"
            name="visibility"
            checked={eventData.visibility === 'public'}
            value="public"
            onChange={(e: any) =>
              onChangeEventData('visibility', e.target.value)
            }
          >
            Public
          </FormControl>
          <FormControl
            componentClass="radio"
            name="visibility"
            value="private"
            checked={eventData.visibility === 'private'}
            onChange={(e: any) =>
              onChangeEventData('visibility', e.target.value)
            }
          >
            Private
          </FormControl>
        </FormGroup>
        {eventData.visibility === 'private' && (
          <>
            <SelectTeamMembers
              label="Invite people"
              name="recipientIds"
              initialValue={recipientIds}
              onSelect={setRecipientIds}
            />
            <br />
          </>
        )}
        <CustomRangeContainer>
          <DateControl
            {...formProps}
            value={eventData.startDate}
            required={true}
            name="startDate"
            onChange={(date) => onChangeEventData('startDate', date)}
            placeholder={'Start date (required)'}
            dateFormat={'YYYY-MM-DD HH:mm:ss'}
            timeFormat={true}
          />
          <DateControl
            {...formProps}
            value={eventData.endDate}
            required={true}
            name="endDate"
            placeholder={'End date (required)'}
            onChange={(date) => onChangeEventData('endDate', date)}
            dateFormat={'YYYY-MM-DD HH:mm:ss'}
            timeFormat={true}
          />
        </CustomRangeContainer>

        <FormGroup>{title(formProps, item)}</FormGroup>
        <FormGroup>{description(formProps, item)}</FormGroup>

        <FormGroup>
          <FormControl
            placeholder="Where"
            componentClass="textarea"
            value={eventData.where}
            onChange={(e: any) => onChangeEventData('where', e.target.value)}
          />
        </FormGroup>
        <Select
          placeholder="Choose department"
          name="departmentId"
          value={departmentIds}
          onChange={onChangeDepartment}
          multi={true}
          options={getDepartmentOptions(departments)}
        />

        <FormGroup>
          <GenerateFields
            fields={fields}
            customFieldsData={customFieldsData}
            setCustomFieldsData={setCustomFieldsData}
          />
        </FormGroup>
        <FormGroup>
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
          <Select
            placeholder="Choose unit"
            name="unitId"
            value={unitId}
            onChange={onChangeUnit}
            multi={false}
            options={getDepartmentOptions(units)}
          />
        </FormGroup>

        <FormGroup>
          <UploadItems>
            <div>
              <ControlLabel>Add attachments:</ControlLabel>
              <Uploader
                defaultFileList={attachments || []}
                onChange={setAttachment}
              />
            </div>
          </UploadItems>
        </FormGroup>

        <GenerateFields
          fields={fields}
          customFieldsData={customFieldsData}
          setCustomFieldsData={setCustomFieldsData}
        />
        <UploadItems>
          <div>
            <ControlLabel required={true}>Add images:</ControlLabel>
            <Uploader defaultFileList={images || []} onChange={setImages} />
          </div>
        </UploadItems>
        {renderButton({
          values: {
            title: values.title,
            description: values.description ? values.description : null,
            contentType: 'event',
            attachments,
            images,
            recipientIds,
            customFieldsData,
            eventData,
            departmentIds,
            branchIds,
            unitId
          },
          isSubmitted,
          callback: closeModal ? closeModal : insideCloseModal
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
        <NameCard.Avatar user={currentUser} size={45} />
        <ModalTrigger
          dialogClassName="create-post"
          size="lg"
          title="Create post"
          trigger={<CreateInput>{__('Create new event')}</CreateInput>}
          content={content}
        />
      </FlexRow>
    </CreateFormContainer>
  );
}
