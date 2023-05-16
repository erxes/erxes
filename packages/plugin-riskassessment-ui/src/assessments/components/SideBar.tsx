import {
  Box,
  ControlLabel,
  DateControl,
  FormGroup,
  Icon,
  Sidebar,
  Tip,
  __
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import Select from 'react-select-plus';
import { cardTypes, statusColorConstant } from '../../common/constants';
import {
  FilterByTags,
  SelectIndicatorGroups,
  SelectIndicators,
  SelectOperations
} from '../../common/utils';
import {
  Box as StatusBox,
  ClearableBtn,
  ColorBox,
  CustomRangeContainer,
  EndDateContainer,
  FormContainer as Container,
  Padding,
  SidebarHeader
} from '../../styles';

interface LayoutProps {
  children: React.ReactNode;
  label: string;
  field: any;
  clearable?: boolean;
  type?: string;
}

export function SideBar({ history, queryParams }) {
  const generateQueryParamsDate = params => {
    return params ? new Date(parseInt(params)).toString() : '';
  };

  const handleRiskIndicator = values => {
    removeParams(history, 'page');
    setParams(history, { riskIndicatorIds: values });
  };
  const selectStatus = color => {
    removeParams(history, 'page');
    setParams(history, { status: color });
  };

  const dateOrder = (value, name) => {
    removeParams(history, 'page');
    setParams(history, {
      [name]: new Date(value).valueOf()
    });
  };
  const onChangeCardType = e => {
    removeParams(history, 'page');
    setParams(history, { cardType: e.value });
  };
  const handleSelectStructure = (values, name) => {
    removeParams(history, 'page');
    setParams(history, { [name]: [...values] });
  };
  const CustomForm = ({ children, label, field, clearable }: LayoutProps) => {
    const handleClearable = () => {
      if (Array.isArray(field)) {
        field.forEach(name => {
          return removeParams(history, name);
        });
      }
      removeParams(history, field);
    };

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        {clearable && (
          <ClearableBtn onClick={handleClearable}>
            <Tip text="Clear">
              <Icon icon="cancel-1" />
            </Tip>
          </ClearableBtn>
        )}
        {children}
      </FormGroup>
    );
  };

  const renderFiltersSelectionExtraBtn = () => {
    const params = [
      queryParams.branchIds,
      queryParams.departmentIds,
      queryParams.operationIds,
      queryParams.cardType,
      queryParams.riskIndicatorIds
    ].every(i => !i);

    if (params) {
      return <></>;
    }

    const removeFilters = () => {
      removeParams(
        history,
        'branchIds',
        'departmentIds',
        'operationIds',
        'cardType',
        'riskIndicatorIds'
      );
    };

    return (
      <button onClick={removeFilters}>
        <Icon icon="cancel-1" />
      </button>
    );
  };

  return (
    <Sidebar
      full
      header={<SidebarHeader>{__('Additional Filter')}</SidebarHeader>}
    >
      <Padding>
        <FilterByTags history={history} queryParams={queryParams} />
        <Box
          title="Filters by Selection"
          name="filterBySelection"
          isOpen
          extraButtons={renderFiltersSelectionExtraBtn()}
        >
          <Padding>
            <CustomForm
              label="Card type"
              field={'cardType'}
              clearable={!!queryParams?.cardType}
            >
              <Select
                placeholder={__('Select Type')}
                value={queryParams?.cardType}
                options={cardTypes}
                multi={false}
                onChange={onChangeCardType}
              />
            </CustomForm>
            <CustomForm
              label="Indicators groupg"
              field={'groupIds'}
              clearable={!!queryParams.groupIds}
            >
              <SelectIndicatorGroups
                name="groupIds"
                label="Select indicator groups"
                initialValue={queryParams?.groupIds}
                onSelect={handleSelectStructure}
                multi={true}
              />
            </CustomForm>
            <CustomForm
              label="Indicators"
              field={'riskIndicatorIds'}
              clearable={!!queryParams.riskIndicatorIds}
            >
              <SelectIndicators
                name="riskIndicatorIds"
                label="Select risk indicators"
                initialValue={queryParams?.riskIndicatorIds}
                onSelect={handleSelectStructure}
                multi={true}
              />
            </CustomForm>
            <CustomForm
              label={'Branches'}
              field={'branchIds'}
              clearable={!!queryParams?.branchIds}
            >
              <SelectBranches
                name="branchIds"
                label="Select Branches"
                initialValue={queryParams?.branchIds}
                onSelect={handleSelectStructure}
                multi={true}
              />
            </CustomForm>
            <CustomForm
              label={'Departments'}
              field={'departmentIds'}
              clearable={!!queryParams?.departmentIds}
            >
              <SelectDepartments
                name="departmentIds"
                label="Select Departments"
                initialValue={queryParams?.departmentIds}
                onSelect={handleSelectStructure}
                multi={true}
              />
            </CustomForm>
            <CustomForm
              label={'Operations'}
              field={'operationIds'}
              clearable={!!queryParams?.operationIds}
            >
              <SelectOperations
                name="operationIds"
                label="Select Operations"
                initialValue={queryParams?.operationIds}
                onSelect={handleSelectStructure}
                multi={true}
              />
            </CustomForm>
          </Padding>
        </Box>
        <CustomForm
          label="Status"
          field={'status'}
          clearable={!!queryParams.status}
        >
          <Container row>
            {statusColorConstant.map(status => (
              <StatusBox
                selected={queryParams.Status === status.name}
                onClick={() => selectStatus(status.name)}
                key={status.color}
              >
                <Container justifyCenter row gap align="center">
                  <Tip placement="bottom" text={status.label}>
                    <ColorBox color={status.color} />
                  </Tip>
                </Container>
              </StatusBox>
            ))}
          </Container>
        </CustomForm>
        <CustomForm
          label="Created Date Range"
          field={['createdAtFrom', 'createdAtTo']}
          clearable={queryParams?.createdAtFrom || queryParams?.createdAtTo}
        >
          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="createdAtFrom"
                value={generateQueryParamsDate(queryParams?.createdAtFrom)}
                placeholder="select from date "
                onChange={e => dateOrder(e, 'createdAtFrom')}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="createdAtTo"
                  value={generateQueryParamsDate(queryParams?.createdAtTo)}
                  placeholder="select to date "
                  onChange={e => dateOrder(e, 'createdAtTo')}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </CustomForm>
        <CustomForm
          label="Closed Date Range"
          field={['closedAtFrom', 'closedAtTo']}
          clearable={queryParams?.closedAtFrom || queryParams?.closedAtTo}
        >
          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="closedAtFrom"
                value={generateQueryParamsDate(queryParams?.closedAtFrom)}
                placeholder="select from date "
                onChange={e => dateOrder(e, 'closedAtFrom')}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="closedAtTo"
                  value={generateQueryParamsDate(queryParams?.closedAtTo)}
                  placeholder="select to date "
                  onChange={e => dateOrder(e, 'closedAtTo')}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </CustomForm>
      </Padding>
    </Sidebar>
  );
}
