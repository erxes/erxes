import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IButtonMutateProps, IFormProps, IOption } from '@erxes/ui/src/types';
import { __, Alert } from '@erxes/ui/src/utils';
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
import SelectBoards from '@erxes/ui-forms/src/settings/properties/containers/SelectBoardPipeline';
import { Chooser, ModalTrigger } from '@erxes/ui/src/components';

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
  const [companyId, setCompanyId] = useState(meeting?.companyId || '');
  const [title, setTitle] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [dealIds, setDealIds] = useState(dealInitialId);

  const [pipelineIds, setPipelineIds] = useState([]);
  const [boardIds, setBoardIds] = useState([]);
  const [selectedItems, setSelectedItems] = useState();

  const [startDate, setStartDate] = useState<string | Date>(
    calendarDate?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState<string | Date>(
    calendarDate?.endDate || ''
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
    if (new Date() < dateVal) {
      setEndDate(dateVal);
    } else Alert.warning('Please choose the correct date');
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

  const onDealSelect = ids => {
    setDealIds(ids);
  };

  const onCompanySelect = companyId => {
    setCompanyId(companyId);
  };

  const onMethodSelect = e => {
    setSelectedMethod((e.target as HTMLInputElement).value);
  };

  const itemsChange = items => {
    console.log(items, 'hha');

    const itemPipelineIds = items.flatMap(params => params.pipelineIds);
    const itemBoardIds = items.flatMap(params => params.boardId);
    setPipelineIds([...itemPipelineIds]);
    setBoardIds([...itemBoardIds]);

    setSelectedItems(items);

    // this.setState({ selectedItems: items }, () => {
    //   const boardsPipelines =
    //     items &&
    //     items.map((e) => {
    //       const boardsPipeline = {
    //         boardId: e.boardId,
    //         pipelineIds: e.pipelineIds,
    //       };

    //       return boardsPipeline;
    //     });

    //   this.props.onChangeItems(boardsPipelines);
    // });
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

    // console.log(pipelineIds, 'pipelineIds:', boardIds, 'boardIds');
    const filterParams = {
      relType: 'deal'
    } as any;

    if (companyId) {
      filterParams.companyIds = [companyId];
    }
    if (pipelineIds && pipelineIds.length > 0) {
      filterParams.pipelineIds = pipelineIds;
    }

    if (boardIds && boardIds.length > 0) {
      filterParams.boardIds = boardIds;
    }

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__('Add deal')}
      </Button>
    );

    const content = props => {
      const onCloseModal = () => {
        props.closeModal();
      };

      return (
        <></>
        // <JobReferChooser
        //   {...props}
        //   closeModal={onCloseModal}
        //   onSelect={() => {}}
        //   types={['end']}
        //   // categoryId={this.state.categoryId}
        //   data={{
        //     name: 'Deals',
        //     datas: [],
        //   }}
        //   limit={1}
        // />
      );
    };
    // filterParams.companyIds = companyId ? [companyId] : undefined;
    // filterParams.pipelineIds = pipelineIds ? pipelineIds : undefined;
    // filterParams.boardIds = boardIds ? boardIds : undefined;

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
            initialValue={companyId}
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
        {/* <FormGroup>
          <ControlLabel>Select Board </ControlLabel>
          <SelectDeal
            label="Choose board"
            name="boardId"
            initialValue={object?.dealIds || dealIds}
            onSelect={onDealSelect}
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Select Pipeline </ControlLabel>
          <SelectDeal
            label="Choose pipeline"
            name="pipelineId"
            initialValue={object?.dealIds || dealIds}
            onSelect={onDealSelect}
            multi={true}
          />
        </FormGroup> */}

        <SelectBoards
          isRequired={false}
          onChangeItems={itemsChange}
          type={'deal'}
          selectedItems={selectedItems}
        />

        <FormGroup>
          <ControlLabel>Select Deal</ControlLabel>
          {/* <ModalTrigger
            title="Choose a JOB"
            trigger={trigger}
            size="lg"
            content={content}
          /> */}

          {/* <Chooser
            title="Choose deal"
            datas={[]}
            data={{}}
            search={() => {}}
            clearState={() => {}}
            onSelect={() => {}}
            closeModal={() => closeModal()}
            renderName={(file) => file.name}
            perPage={5}
            limit={100}
          /> */}
          <SelectDeal
            label="Choose deal"
            name="dealIds"
            initialValue={object?.dealIds || dealIds}
            onSelect={onDealSelect}
            multi={true}
            filterParams={filterParams}
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
