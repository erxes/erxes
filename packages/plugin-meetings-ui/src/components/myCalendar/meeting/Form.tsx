import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, Alert } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IMeeting } from '../../../types';
import {
  CustomRangeContainer,
  MeetingDetailColumn,
  MeetingDetailRow
} from '../../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IUser } from '@erxes/ui/src/auth/types';
import { CompaniesQueryResponse } from '@erxes/ui-contacts/src/companies/types';
import { DealsQueryResponse, IDeal } from '@erxes/ui-cards/src/deals/types';

import { ModalTrigger } from '@erxes/ui/src/components';
import DealChooser from '../../../containers/myCalendar/meeting/Chooser';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';

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
  const { meeting, queryParams, calendarDate, dealId } = props;

  const dealInitialId = dealId ? [dealId] : '';

  const [userIds, setUserIds] = useState([props.currentUser._id] || []);
  const [companyId, setCompanyId] = useState(meeting?.companyId || '');
  const [title, setTitle] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [dealIds, setDealIds] = useState(dealInitialId);

  const [startDate, setStartDate] = useState<string | Date>(
    calendarDate?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState<string | Date>(
    calendarDate?.endDate || ''
  );

  const [selectedDeals, setSelectedDeals] = useState(meeting?.deals || []);

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
    if (new Date() < dateVal) {
      setEndDate(dateVal);
    } else {
      Alert.warning('Please choose the correct date');
    }
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
          timeFormat="HH:mm a"
        />
        <DateControl
          value={endDate || ''}
          required={false}
          name="endDate"
          placeholder={'End date'}
          onChange={onEndDateChange}
          dateFormat={'YYYY-MM-DD'}
          timeFormat="HH:mm a"
        />
      </CustomRangeContainer>
    );
  };

  const onUserSelect = users => {
    setUserIds(users);
  };

  const onMethodSelect = e => {
    setSelectedMethod((e.target as HTMLInputElement).value);
  };

  const renderBulkProductChooser = () => {
    const dealsOnChange = (datas: any, selectedCompanyId: string) => {
      const dealsId = datas?.map(data => data._id);

      const { companyId: cId } = JSON.parse(
        localStorage.getItem('erxes_deals:chooser_filter') || '{}'
      );

      const filterId = selectedCompanyId || cId;

      const companyName =
        datas?.find(deal => {
          const selectedCompanies =
            deal.companies && deal.companies.filter(c => c._id === filterId);
          return selectedCompanies && selectedCompanies.length > 0;
        })?.companies?.[0]?.primaryName || '';

      setDealIds(dealsId);
      setSelectedDeals(datas);
      setCompanyId(filterId);
      setTitle(companyName);
    };

    const content = ({ closeModal }) => {
      const updatedProps = {
        ...props,
        closeModal
      };
      return (
        <DealChooser
          {...updatedProps}
          onSelect={dealsOnChange}
          data={{
            name: 'Deal',
            deals: []
          }}
        />
      );
    };

    const trigger = (
      <Button btnStyle="primary" icon="plus-circle">
        Choose deal and company
      </Button>
    );

    return (
      <ModalTrigger
        title="Choose deal and company"
        trigger={trigger}
        size="xl"
        content={content}
      />
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;
    const object = meeting || ({} as IMeeting);

    return (
      <>
        <FormGroup>
          <h4>{title || object?.title}</h4>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={false}> Deal and company </ControlLabel>
          {selectedDeals.length > 0 && (
            <MeetingDetailRow>
              <MeetingDetailColumn>
                <DrawerDetail>
                  <span>Deal names: </span>
                  {selectedDeals?.map((deal, index) => (
                    <label key={index}>{deal.name},</label>
                  ))}
                </DrawerDetail>
              </MeetingDetailColumn>
            </MeetingDetailRow>
          )}
          <CustomRangeContainer>
            {selectedDeals.length === 0 && (
              <FormControl
                componentClass="input"
                placeholder="Deal name"
                type="string"
                value={''}
                disabled={true}
              />
            )}
            <FormControl
              componentClass="input"
              placeholder="Company name"
              type="string"
              value={title || object?.title}
              disabled={true}
            />
            {renderBulkProductChooser()}
          </CustomRangeContainer>
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

        <ModalFooter id={'AddTagButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            passedName: 'meeting',
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
