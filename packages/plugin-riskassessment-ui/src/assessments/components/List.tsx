import {
  Button,
  ControlLabel,
  FormGroup,
  Icon,
  router,
  Sidebar,
  SortHandler,
  Table,
  Tip,
  DateControl,
  __,
  HeaderDescription
} from '@erxes/ui/src';
import React from 'react';
import {
  DefaultWrapper,
  SelectOperation,
  SelectRiskIndicator
} from '../../common/utils';
import {
  cardTypes,
  statusColorConstant,
  subMenu
} from '../../common/constants';
import Row from './Row';
import { setParams } from '@erxes/ui/src/utils/router';
import { DateContainer } from '@erxes/ui/src/styles/main';
import {
  ClearableBtn,
  FormContainer as Container,
  Box as StatusBox,
  ColorBox,
  CustomRangeContainer,
  EndDateContainer,
  Box,
  SidebarHeader,
  Padding
} from '../../styles';
import Select from 'react-select-plus';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
type Props = {
  list: any[];
  totalCount: number;
  queryParams: any;
  history: any;
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

class List extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderContent = () => {
    const { list } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Card type')}</th>
            <th>{__('Card Name')}</th>
            <th>{__('Risk Indicators')}</th>
            <th>{__('Branches')}</th>
            <th>{__('Departments')}</th>
            <th>{__('Opearations')}</th>
            <th>{__('Status')}</th>
            <th>{__('Result Score')}</th>
            <th>
              <SortHandler sortField="createdAt" />
              {__('Created At')}
            </th>
            <th>
              <SortHandler sortField="closedAt" />
              {__('Closed At')}
            </th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <Row item={item} key={item._id} />
          ))}
        </tbody>
      </Table>
    );
  };

  render() {
    const { totalCount, queryParams } = this.props;

    const handleRiskIndicator = values => {
      setParams(this.props.history, { riskIndicatorIds: values });
    };
    const selectStatus = color => {
      router.setParams(this.props.history, { status: color });
    };

    const dateOrder = (value, name) => {
      router.setParams(this.props.history, {
        [name]: new Date(value).valueOf()
      });
    };
    const onChangeCardType = e => {
      router.setParams(this.props.history, { cardType: e.value });
    };
    const handleSelectStructure = (values, name) => {
      router.setParams(this.props.history, { [name]: [...values] });
    };
    const CustomForm = ({ children, label, field, clearable }: LayoutProps) => {
      const handleClearable = () => {
        if (Array.isArray(field)) {
          field.forEach(name => {
            return router.removeParams(this.props.history, name);
          });
        }
        router.removeParams(this.props.history, field);
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

    const sidebar = (
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
            <SelectOperation
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

    const leftActionBar = (
      <HeaderDescription
        title="Risk Assessments"
        icon="/images/actions/13.svg"
        description=""
      />
    );

    const updatedProps = {
      title: 'Assessment',
      content: this.renderContent(),
      leftActionBar,
      subMenu,
      sidebar,
      totalCount
    };
    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
