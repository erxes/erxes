import React from 'react';
import {
  DateControl,
  Sidebar as CommonSideBar,
  ControlLabel,
  FormGroup,
  Icon,
  SelectTeamMembers,
  Tip,
  __,
  Toggle,
  Button
} from '@erxes/ui/src';
import {
  ClearableBtn,
  Padding,
  SelectBox,
  SelectBoxContainer,
  SidebarHeader,
  CustomRangeContainer,
  EndDateContainer
} from '../../styles';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import { responseTypes } from '../../common/constants';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { Row } from '../../styles';

interface LayoutProps {
  children: React.ReactNode;
  label: string;
  field: any;
  clearable?: boolean;
  type?: string;
}

export default function SideBar({ history, queryParams }) {
  const CustomField = ({ children, label, field, clearable }: LayoutProps) => {
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

  const handleSelect = (value, name) => {
    removeParams(history, name);
    setParams(history, { [name]: value });
  };

  const generateQueryParamsDate = params => {
    return params ? new Date(parseInt(params)).toString() : '';
  };
  const dateOrder = (value, name) => {
    removeParams(history, 'page');
    setParams(history, {
      [name]: new Date(value).valueOf()
    });
  };

  return (
    <CommonSideBar
      full
      header={
        <Padding>
          <SidebarHeader>{__('Filters')}</SidebarHeader>
        </Padding>
      }
    >
      <Padding>
        <CustomField
          label="Requester"
          field="requesterId"
          clearable={queryParams?.requesterId}
        >
          <SelectTeamMembers
            label="Choose Requester"
            name="requesterId"
            onSelect={handleSelect}
            multi={false}
            initialValue={queryParams?.requesterId}
          />
        </CustomField>
        <CustomField
          label="recipient"
          field="recipientId"
          clearable={queryParams?.recipientId}
        >
          <SelectTeamMembers
            label="Choose recipient"
            name="recipientId"
            onSelect={handleSelect}
            multi={false}
            initialValue={queryParams?.recipientId}
          />
        </CustomField>
        <CustomField
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
        </CustomField>
        <CustomField
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
        </CustomField>
        <CustomField
          label=""
          field="onlyWaitingMe"
          clearable={queryParams?.onlyWaitingMe}
        >
          <Row spaceBetween>
            <ControlLabel>{__('Waiting Me')}</ControlLabel>
            <Toggle
              checked={['true'].includes(queryParams?.onlyWaitingMe)}
              onChange={() =>
                handleSelect(
                  !['true'].includes(queryParams?.onlyWaitingMe),
                  'onlyWaitingMe'
                )
              }
            />
          </Row>
        </CustomField>
        <CustomField
          label="Response Type"
          field="type"
          clearable={queryParams?.type}
        >
          <SelectBoxContainer>
            {responseTypes.map(type => (
              <SelectBox
                key={type.value}
                className={type.value === queryParams?.type ? 'active' : ''}
                onClick={() => handleSelect(type.value, 'type')}
              >
                <Icon icon={type.icon} color={type.color} />
                {type.label}
              </SelectBox>
            ))}
          </SelectBoxContainer>
        </CustomField>
        <CustomField
          label={'Status'}
          field="archived"
          clearable={queryParams?.archived}
        >
          <SelectBoxContainer>
            <SelectBox
              onClick={() =>
                handleSelect(
                  ['false', undefined].includes(queryParams?.archived),
                  'archived'
                )
              }
            >
              {queryParams?.archived === 'true' ? 'Archived' : 'Active'}
              <Icon
                icon={
                  queryParams?.archived === 'true'
                    ? 'calendar-alt'
                    : 'archive-alt'
                }
              />
            </SelectBox>
          </SelectBoxContainer>
        </CustomField>
      </Padding>
    </CommonSideBar>
  );
}
