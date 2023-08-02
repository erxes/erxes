import React, { useState } from 'react';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { Form, FormControl, Uploader, SelectTeamMembers } from '@erxes/ui/src/';
import { IFormProps, IButtonMutateProps } from '@erxes/ui/src/types';
import {
  UploadItems,
  CustomRangeContainer,
  SelectWrapper,
  ClearButton
} from '../styles';
import { title, description, getDepartmentOptions } from '../utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import GenerateFields from './GenerateFields';
import { __ } from '@erxes/ui/src/utils';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import Select from 'react-select-plus';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  item?: any;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => any;
  fields: any[];
  unitList?: any[];
  departments: any[];
};

export default function EventForm(props: Props) {
  const { item = {}, fields } = props;
  const unitList = props.unitList || [];

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
  const [departmentIds, setDepartmentIds] = useState(item.departmentIds || []);
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

  const onChangeEventData = (key, value) => {
    setEventData({ ...eventData, [key]: value });
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
        <span>
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
        </span>
        {eventData.visibility === 'private' && (
          <>
            <SelectTeamMembers
              label="Who"
              name="recipientIds"
              initialValue={recipientIds}
              onSelect={setRecipientIds}
            />
            <br />
          </>
        )}
        <CustomRangeContainer>
          <DateControl
            value={eventData.startDate}
            required={false}
            name="startDate"
            onChange={date => onChangeEventData('startDate', date)}
            placeholder={'Start date'}
            dateFormat={'YYYY-MM-DD HH:mm:ss'}
            timeFormat={true}
          />
          <DateControl
            value={eventData.endDate}
            required={false}
            name="endDate"
            placeholder={'End date'}
            onChange={date => onChangeEventData('endDate', date)}
            dateFormat={'YYYY-MM-DD HH:mm:ss'}
            timeFormat={true}
          />
        </CustomRangeContainer>

        {title(formProps, item)}
        {description(formProps, item)}

        <FormControl
          placeholder="Where"
          componentClass="textarea"
          value={eventData.where}
          onChange={(e: any) => onChangeEventData('where', e.target.value)}
        />

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
            label={'Choose Unit'}
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
        </UploadItems>
        <UploadItems>
          <div>
            <Uploader defaultFileList={images || []} onChange={setImages} />
            <ControlLabel>Add images:</ControlLabel>
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
          callback: closeModal
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
