import {
  ActionButtons,
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  Icon,
  SortHandler,
  Tip,
  Wrapper,
  __,
  router
} from '@erxes/ui/src';
import {
  Column,
  DateContainer,
  ScrollWrapper
} from '@erxes/ui/src/styles/main';
import {
  ClearBtnContainer,
  FilterRowContainer,
  PaddingHorizontal,
  PaddingTop,
  Row,
  SideBarRow
} from '../../../styles';

import { setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { SelectOwner } from '../utils';
import Select from 'react-select-plus';
import { ORDER_TYPES } from '../constants';
import { Columns } from '@erxes/ui/src/styles/chooser';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import {
  CustomRangeContainer,
  EndDateContainer
} from '@erxes/ui-forms/src/forms/styles';
interface LayoutProps {
  children: React.ReactNode;
  label: string;
  clearable: boolean;
  type: string;
  sortable?: boolean;
  sortField?: string;
}

type Props = {
  loadingMainQuery: boolean;
  history: any;
  queryParams: any;
  refetch: (variable: any) => void;
};

class SideBar extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { refetch, history, queryParams } = this.props;

    const handleClear = (type: string) => {
      router.removeParams(history, type);
    };

    const handleValue = (e: any) => {
      const { name, value } = e.currentTarget as HTMLInputElement;
      router.setParams(history, { [name]: value });
    };

    const handleDate = (e: any, type: string) => {
      router.setParams(history, { [type]: String(e) });
    };

    const checkParams = type => {
      return router.getParam(history, type) ? true : false;
    };

    const Form = ({
      children,
      clearable,
      label,
      type,
      sortable,
      sortField
    }: LayoutProps) => (
      <FormGroup>
        <Columns>
          <Column>
            <SideBarRow>
              <ControlLabel>{label}</ControlLabel>
              {sortable && <SortHandler sortField={sortField} />}
            </SideBarRow>
          </Column>
          {/* <ActionButtons> */}
          {clearable && (
            <ClearBtnContainer onClick={() => handleClear(type)}>
              <Tip text={'Clear filter'} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </ClearBtnContainer>
          )}
          {/* </ActionButtons> */}
        </Columns>

        {children}
      </FormGroup>
    );

    const SideBarFilter = () => {
      const handleSelect = (value, name) => {
        setParams(history, { [name]: value });
      };

      return (
        <>
          <Wrapper.Sidebar.Section.Title>
            Addition filters
          </Wrapper.Sidebar.Section.Title>
          <SelectOwner
            obj={queryParams}
            onChange={handleSelect}
            isClearable
            onClickClear={handleClear}
          />
          {/* <Form
            label='Order Type'
            clearable={checkParams('sortField')}
            type='sortField'
            sortable={queryParams?.sortField}
            sortField={queryParams?.sortField}
          >
            <Select
              placeholder={__('Order Type')}
              options={ORDER_TYPES}
              value={queryParams?.sortField}
              onChange={({ value }) => handleSelect(value, 'sortField')}
            />
          </Form>
          <ControlLabel>{__('Created At')}</ControlLabel> */}
          <CustomRangeContainer>
            <Form label="" clearable={checkParams('fromDate')} type="fromDate">
              <DateContainer>
                <DateControl
                  required={true}
                  name="startDate"
                  placeholder={'Choose start date'}
                  value={queryParams?.fromDate}
                  onChange={e => handleDate(e, 'fromDate')}
                />
              </DateContainer>
            </Form>
            <EndDateContainer>
              <Form label="" clearable={checkParams('toDate')} type="toDate">
                <DateContainer>
                  <DateControl
                    required={true}
                    name="fromDate"
                    placeholder={'Choose from date'}
                    value={queryParams?.toDate}
                    onChange={e => handleDate(e, 'toDate')}
                  />
                </DateContainer>
              </Form>
            </EndDateContainer>
          </CustomRangeContainer>
        </>
      );
    };
    return (
      <Wrapper.Sidebar hasBorder>
        <PaddingHorizontal>
          <SideBarFilter />
        </PaddingHorizontal>
      </Wrapper.Sidebar>
    );
  }
}

export default SideBar;
