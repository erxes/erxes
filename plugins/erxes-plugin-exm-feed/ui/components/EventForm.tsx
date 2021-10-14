import React, { useState } from 'react';
import DateControl from 'erxes-ui/lib/components/form/DateControl';
import { Form, FormControl, Uploader, SelectTeamMembers } from 'erxes-ui';
import { IFormProps, IButtonMutateProps } from 'erxes-ui/lib/types';
import { UploadItems } from '../styles';
import { title, description } from '../utils';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import GenerateFields from './GenerateFields';
import { __ } from 'erxes-ui/lib/utils';

type Props = {
  item?: any;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => any;
  fields: any[];
};

export default function EventForm(props: Props) {
  const { item = {}, fields } = props;

  const [attachments, setAttachment] = useState(item.attachments || []);
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

  const onChangeEventData = (key, value) => {
    setEventData({ ...eventData, [key]: value });
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <FormControl
          componentClass='radio'
          name='visibility'
          checked={eventData.visibility === 'public'}
          value='public'
          onChange={(e: any) => onChangeEventData('visibility', e.target.value)}
        >
          Public
        </FormControl>
        <FormControl
          componentClass='radio'
          name='visibility'
          value='private'
          checked={eventData.visibility === 'private'}
          onChange={(e: any) => onChangeEventData('visibility', e.target.value)}
        >
          Private
        </FormControl>
        <DateControl
          value={eventData.startDate}
          required={false}
          name='startDate'
          onChange={date => onChangeEventData('startDate', date)}
          placeholder={'Start date'}
          dateFormat={'YYYY-MM-DD HH:mm:ss'}
          timeFormat={true}
        />
        <DateControl
          value={eventData.endDate}
          required={false}
          name='endDate'
          placeholder={'End date'}
          onChange={date => onChangeEventData('endDate', date)}
          dateFormat={'YYYY-MM-DD HH:mm:ss'}
          timeFormat={true}
        />
        <FormControl
          placeholder='Where'
          componentClass='textarea'
          value={eventData.where}
          onChange={(e: any) => onChangeEventData('where', e.target.value)}
        />
        <SelectTeamMembers
          label='Guests'
          name='recipientIds'
          initialValue={recipientIds}
          onSelect={setRecipientIds}
        />
        {title(formProps, item)}
        {description(formProps, item)}
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
        {renderButton({
          values: {
            title: values.title,
            description: values.description ? values.description : null,
            contentType: 'event',
            attachments,
            recipientIds,
            customFieldsData,
            eventData
          },
          isSubmitted,
          callback: closeModal
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
