import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IMeeting } from '../../../types';
import { CustomRangeContainer } from '../../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IUser } from '@erxes/ui/src/auth/types';
import { CompaniesQueryResponse } from '@erxes/ui-contacts/src/companies/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  meeting?: IMeeting;
  queryParams: any;
  currentUser: IUser;
  companiesQuery: CompaniesQueryResponse;
  calendarDate?: { startDate: string; endDate: string };
} & ICommonFormProps;

export const MeetingForm = (props: Props) => {
  const { companiesQuery, meeting, queryParams, calendarDate } = props;
  const { companies } = companiesQuery || {};
  const [userIds, setUserIds] = useState([props.currentUser._id] || []);
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const [startDate, setStartDate] = useState<string | Date>(
    calendarDate?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState<string | Date>(
    calendarDate?.endDate || new Date()
  );

  useEffect(() => {
    setTitle(companies?.find(c => c._id === companyId)?.primaryName || '');
  }, [companyId]);

  const generateDoc = (values: {
    _id?: string;
    title: string;
    content: string;
    participantIds: string[];
    startDate: string | Date;
    endDate: string | Date;
    companyId: string;
    method: string;
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
      finalValues.title = title;
    }
    if (selectedMethod) {
      finalValues.method = selectedMethod;
    }

    return {
      ...finalValues
    };
  };

  const methodOptions = [
    { value: 'online', label: 'Online meeting' },
    { value: 'face-to-face', label: 'Face-to-face meeting' },
    { value: 'offline', label: 'Offline meeting' }
  ];

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

  const onCompanySelect = e => {
    setCompanyId((e.target as HTMLInputElement).value);
  };

  const onMethodSelect = e => {
    setSelectedMethod((e.target as HTMLInputElement).value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;
    const object = meeting || ({} as IMeeting);

    const companyOptions =
      (companies &&
        companies.map((company: any) => ({
          value: company._id,
          label: company.primaryName || '',
          avatar: company.avatar
        }))) ||
      [];

    return (
      <>
        <FormGroup>
          <h4>{object?.title || title}</h4>
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Choose Company</ControlLabel>
          <FormControl
            {...formProps}
            name="companyId"
            defaultValue={object.companyId}
            componentClass="select"
            required={true}
            autoFocus={true}
            options={companyOptions}
            onChange={onCompanySelect}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={false}>Start and Close date</ControlLabel>
          {renderDatePicker()}
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Method </ControlLabel>
          <FormControl
            {...formProps}
            name="method"
            defaultValue={object.method}
            componentClass="select"
            required={true}
            options={methodOptions}
            onChange={onMethodSelect}
          />
        </FormGroup>

        {selectedMethod === 'offline' && (
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
        )}

        <FormGroup>
          <div style={{ marginBottom: '0' }}>
            <ControlLabel>Team members </ControlLabel>
            <div style={{ width: '100%' }}>
              <SelectTeamMembers
                initialValue={object?.participantIds || userIds}
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
