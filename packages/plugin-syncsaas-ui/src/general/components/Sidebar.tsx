import {
  Sidebar as CommonSidebar,
  ControlLabel,
  DateControl,
  FormGroup,
  Icon,
  Tip,
  __
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import {
  ClearableBtn,
  CustomRangeContainer,
  EndDateContainer,
  Padding,
  SidebarHeader
} from '../../styles';

type Props = {
  history: any;
  queryParams: any;
};

interface LayoutProps {
  children: React.ReactNode;
  label: string;
  field: any;
  clearable?: boolean;
  type?: string;
}

const generateQueryParamsDate = params => {
  return params ? new Date(parseInt(params)).toString() : '';
};

class SideBar extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { queryParams, history } = this.props;

    const handleDateChange = (value, name) => {
      removeParams(history, 'page');
      setParams(history, {
        [name]: new Date(value).valueOf()
      });
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
      <CommonSidebar
        full
        header={<SidebarHeader>{__('Additional Filter')}</SidebarHeader>}
      >
        <Padding>
          <CustomForm
            label="Start Date Range"
            field={['startDateFrom', 'startDateTo']}
            clearable={queryParams?.startDateFrom || queryParams?.startDateTo}
          >
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="startDateFrom"
                  value={generateQueryParamsDate(queryParams?.startDateFrom)}
                  placeholder="select from date "
                  onChange={e => handleDateChange(e, 'startDateFrom')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="startDateTo"
                    value={generateQueryParamsDate(queryParams?.startDateTo)}
                    placeholder="select to date "
                    onChange={e => handleDateChange(e, 'startDateTo')}
                  />
                </DateContainer>
              </EndDateContainer>
            </CustomRangeContainer>
          </CustomForm>
          <CustomForm
            label="Expire Date Range"
            field={['expireDateFrom', 'expireDateTo']}
            clearable={queryParams?.expireDateFrom || queryParams?.expireDateTo}
          >
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="expireDateFrom"
                  value={generateQueryParamsDate(queryParams?.expireDateFrom)}
                  placeholder="select from date "
                  onChange={e => handleDateChange(e, 'expireDateFrom')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="expireDateTo"
                    value={generateQueryParamsDate(queryParams?.expireDateTo)}
                    placeholder="select to date "
                    onChange={e => handleDateChange(e, 'expireDateTo')}
                  />
                </DateContainer>
              </EndDateContainer>
            </CustomRangeContainer>
          </CustomForm>
        </Padding>
      </CommonSidebar>
    );
  }
}

export default SideBar;
