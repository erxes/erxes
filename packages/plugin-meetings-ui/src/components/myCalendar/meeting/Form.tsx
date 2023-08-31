import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IMeeting } from '../../../types';
import { CustomRangeContainer } from '../../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';

type Props = {
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  meeting?: IMeeting;
  queryParams: any;
} & ICommonFormProps;

type IItem = {
  order?: string;
  name: string;
  _id: string;
};

export const MeetingForm = (props: Props) => {
  const { meeting, queryParams } = props;

  const [userIds, setUserIds] = useState([]);
  const [companyId, setCompanyId] = useState('');

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const generateDoc = (values: {
    _id?: string;
    name: string;
    content: string;
    participantIds: string[];
    startDate: Date;
    endDate: Date;
    companyId: string;
  }) => {
    const finalValues = values;
    if (meeting) {
      finalValues._id = meeting._id;
    }
    if (userIds) {
      finalValues.participantIds = userIds;
    }
    if (startDate) {
      finalValues.startDate = startDate;
    }
    if (endDate) {
      finalValues.endDate = endDate;
    }
    if (companyId) {
      finalValues.companyId = companyId;
    }
    return {
      ...finalValues
    };
  };

  const onStartDateChange = dateVal => {
    setStartDate(dateVal);
  };

  const onEndDateChange = dateVal => {
    setEndDate(dateVal);
  };

  const renderDatePicker = () => {
    return (
      <CustomRangeContainer>
        <DateControl
          value={startDate || ''}
          required={false}
          name="startDate"
          onChange={onStartDateChange}
          placeholder={'Start date'}
          dateFormat={'YYYY-MM-DD'}
          timeFormat="HH:mm"
        />
        <DateControl
          value={endDate || ''}
          required={false}
          name="endDate"
          placeholder={'End date'}
          onChange={onEndDateChange}
          dateFormat={'YYYY-MM-DD'}
          timeFormat="HH:mm"
        />
      </CustomRangeContainer>
    );
  };

  const onUserSelect = users => {
    setUserIds(users);
  };
  const onCompanySelect = company => {
    setCompanyId(company);
  };

  const renderContent = (formProps: IFormProps) => {
    const { meeting, closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;
    const object = meeting || ({} as IMeeting);
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Meeting title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={false}>Start and Close date</ControlLabel>
          {renderDatePicker()}
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Place</ControlLabel>
          <FormControl
            {...formProps}
            name="location"
            defaultValue={object.location}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <div style={{ marginBottom: '0' }}>
            <ControlLabel>Team members </ControlLabel>
            <div style={{ width: '100%' }}>
              <SelectTeamMembers
                initialValue={object.participantIds || userIds}
                customField="employeeId"
                filterParams={{}}
                queryParams={queryParams}
                label={'Select team member'}
                onSelect={onUserSelect}
                name="userId"
              />
            </div>
          </div>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        {
          <FormGroup>
            <ControlLabel required={true}>Company</ControlLabel>

            <SelectCompanies
              label="Choose Company"
              name="companyId"
              multi={false}
              initialValue={object.companyId}
              onSelect={onCompanySelect}
              customOption={{ value: '', label: 'Choose Company' }}
            />
          </FormGroup>
        }

        <ModalFooter id={'AddTagButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            passedName: 'meetings',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: meeting
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};
