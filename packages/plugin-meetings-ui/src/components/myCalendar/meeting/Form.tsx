import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IButtonMutateProps, IFormProps, IOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IMeeting } from '../../../types';
import { CustomRangeContainer } from '../../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IUser } from '@erxes/ui/src/auth/types';
import { CompaniesQueryResponse } from '@erxes/ui-contacts/src/companies/types';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { DealsQueryResponse } from '@erxes/ui-cards/src/deals/types';
import SelectDeal from './SelectDeal';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  meeting?: IMeeting;
  queryParams: any;
  currentUser: IUser;
  companiesQuery: CompaniesQueryResponse;
  dealsQuery: DealsQueryResponse;
  calendarDate?: { startDate: string; endDate: string };
  dealId?: string;
} & ICommonFormProps;

export const MeetingForm = (props: Props) => {
  const {
    companiesQuery,
    meeting,
    queryParams,
    calendarDate,
    dealsQuery,
    dealId
  } = props;
  const { companies } = companiesQuery || {};
  const { deals } = dealsQuery || {};

  let dealInitialId = dealId ? [dealId] : '';

  const [userIds, setUserIds] = useState([props.currentUser._id] || []);
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [dealIds, setDealIds] = useState(dealInitialId);

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
    dealIds: string[] | string;
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
    if (dealIds && dealIds.length > 0) {
      finalValues.dealIds = dealIds;
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

  const onDealSelect = ids => {
    setDealIds(ids);
  };

  const onCompanySelect = companyId => {
    setCompanyId(companyId);
  };

  const onMethodSelect = e => {
    setSelectedMethod((e.target as HTMLInputElement).value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;
    const object = meeting || ({} as IMeeting);

    let dealOptions =
      (deals &&
        deals.map((deal: any) => ({
          value: deal._id,
          label: deal.name || ''
        }))) ||
      [];
    dealOptions = [{ value: '', label: '' }, ...dealOptions];

    return (
      <>
        <FormGroup>
          <h4>{object?.title || title}</h4>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Choose Company</ControlLabel>
          <SelectCompanies
            label={__('Select a company')}
            name="companyId"
            onSelect={onCompanySelect}
            multi={false}
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
                customField="userIds"
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

        <FormGroup>
          <ControlLabel>Select Deal </ControlLabel>
          <SelectDeal
            label="Choose deal"
            name="dealIds"
            initialValue={object?.dealIds || dealIds}
            onSelect={onDealSelect}
            customOption={{ value: '', label: '...Clear deal filter' }}
            multi={true}
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
