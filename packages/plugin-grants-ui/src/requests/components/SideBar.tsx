import React from 'react';
import {
  BarItems,
  Sidebar as CommonSideBar,
  ControlLabel,
  FormGroup,
  Icon,
  SelectTeamMembers,
  Tip,
  __
} from '@erxes/ui/src';
import {
  ClearableBtn,
  Padding,
  SelectBox,
  SelectBoxContainer,
  SidebarHeader
} from '../../styles';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import { responseTypes } from '../../common/constants';

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
      </Padding>
    </CommonSideBar>
  );
}
