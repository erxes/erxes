import Button from '@erxes/ui/src/components/Button';
import {
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { ITopic } from '../../../types';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  topic?: ITopic;
  meetingId: String;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  participantUserIds: string[];
  meetingStatus: string;
  closeModal?: () => void;
  afterSave?: () => void;
};

export const TopicForm = (props: Props) => {
  const {
    afterSave,
    topic,
    meetingId,
    participantUserIds,
    meetingStatus
  } = props;
  const [ownerId, setOwnerId] = useState(topic?.ownerId);

  const onSelectOwner = value => {
    setOwnerId(value);
  };

  const generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
    ownerId: string;
  }) => {
    const finalValues = values;
    if (topic) {
      finalValues._id = topic._id;
    }
    if (ownerId) {
      finalValues.ownerId = ownerId;
    }
    return {
      ...finalValues,
      meetingId
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { topic, renderButton, closeModal } = props;
    const { values, isSubmitted } = formProps;
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Topic name</ControlLabel>
          <FormControl
            {...formProps}
            defaultValue={topic?.title}
            name="title"
            type="text"
            required={true}
            autoFocus={true}
            disabled={topic ? true : false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={false}>Description</ControlLabel>
          <FormControl
            {...formProps}
            defaultValue={topic?.description}
            name="description"
            type="text"
            required={true}
            autoFocus={true}
            disabled={topic ? true : false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{'Topic Owner'}</ControlLabel>

          <SelectTeamMembers
            label="Choose topic owner"
            name="ownerId"
            initialValue={topic?.ownerId}
            onSelect={onSelectOwner}
            multi={false}
            filterParams={{ ids: participantUserIds, excludeIds: false }}
          />
        </FormGroup>

        {meetingStatus !== 'completed' && (
          <ModalFooter id={'AddTagButtons'}>
            <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
              Cancel
            </Button>
            {renderButton({
              passedName: 'meetings',
              values: generateDoc(values),
              isSubmitted,
              callback: closeModal || afterSave,
              object: topic
            })}
          </ModalFooter>
        )}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};
