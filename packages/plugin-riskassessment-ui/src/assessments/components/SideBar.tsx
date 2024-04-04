import {
  Box,
  ControlLabel,
  FormGroup,
  Icon,
  Sidebar,
  Tip,
  __
} from '@erxes/ui/src';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import Select from 'react-select-plus';
import { cardTypes } from '../../common/constants';
import { FilterByTags } from '../../common/utils';
import { ClearableBtn, Padding, SidebarHeader } from '../../styles';
import { CardFilter } from '../common/utils';

interface LayoutProps {
  children: React.ReactNode;
  label: string;
  field: any;
  clearable?: boolean;
  type?: string;
}

export function SideBar({ history, queryParams }) {
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

  return (
    <Sidebar
      full
      header={<SidebarHeader>{__('Additional Filter')}</SidebarHeader>}
    >
      <Padding>
        <FilterByTags history={history} queryParams={queryParams} />
        <Box title="Card Filters" name="cardFilters" isOpen>
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
            <CardFilter
              type={queryParams.cardType}
              onChange={handleSelectStructure}
              queryParams={queryParams}
              history={history}
            />
          </Padding>
        </Box>
      </Padding>
    </Sidebar>
  );
}
