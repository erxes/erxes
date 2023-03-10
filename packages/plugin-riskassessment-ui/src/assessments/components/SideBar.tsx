import React from 'react';
import {
  Sidebar,
  FormGroup,
  ControlLabel,
  Tip,
  Icon,
  __,
  DateControl
} from '@erxes/ui/src';
import {
  SidebarHeader,
  Padding,
  ClearableBtn,
  FormContainer as Container,
  Box as StatusBox,
  ColorBox,
  CustomRangeContainer,
  EndDateContainer
} from '../../styles';
import { SelectRiskIndicator, SelectOperations } from '../../common/utils';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import Select from 'react-select-plus';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { cardTypes, statusColorConstant } from '../../common/constants';
import { DateContainer } from '@erxes/ui/src/styles/main';

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
    setParams(history, { riskIndicatorIds: values });
  };
  const selectStatus = color => {
    setParams(history, { status: color });
  };

  const dateOrder = (value, name) => {
    setParams(history, {
      [name]: new Date(value).valueOf()
    });
  };
  const onChangeCardType = e => {
    setParams(history, { cardType: e.value });
  };
  const handleSelectStructure = (values, name) => {
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

  return (
    <Sidebar
      full
      header={<SidebarHeader>{__('Additional Filter')}</SidebarHeader>}
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
          label="Risk Indicator"
          field={'riskIndicatorIds'}
          clearable={!!queryParams.riskIndicatorIds}
        >
          <SelectRiskIndicator
            name="riskIndicatorIds"
            label="Select risk indicators"
            initialValue={queryParams?.riskIndicatorIds}
            onSelect={handleRiskIndicator}
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
          field={['createdFrom', 'createdTo']}
          clearable={queryParams?.createdFrom || queryParams?.createdTo}
        >
          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="createdFrom"
                value={generateQueryParamsDate(queryParams?.createdFrom)}
                placeholder="select from date "
                onChange={e => dateOrder(e, 'createdFrom')}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="createdTo"
                  value={generateQueryParamsDate(queryParams?.createdTo)}
                  placeholder="select to date "
                  onChange={e => dateOrder(e, 'createdTo')}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </CustomForm>
        <CustomForm
          label="Closed Date Range"
          field={['closedFrom', 'closedTo']}
          clearable={queryParams?.closedFrom || queryParams?.closedTo}
        >
          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="closedFrom"
                value={generateQueryParamsDate(queryParams?.closedFrom)}
                placeholder="select from date "
                onChange={e => dateOrder(e, 'closedFrom')}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="closedTo"
                  value={generateQueryParamsDate(queryParams?.closedTo)}
                  placeholder="select to date "
                  onChange={e => dateOrder(e, 'closedTo')}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </CustomForm>
      </Padding>
    </Sidebar>
  );
}
