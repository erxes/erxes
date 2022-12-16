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
import { DefaultWrapper, SelectWithRiskAssessment } from '../../common/utils';
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
            <th>{__('Risk Assessment')}</th>
            <th>{__('Status')}</th>
            <th>{__('Result Score')}</th>
            <th>
              <SortHandler sortField="createdAt" />
              {__('Created At')}
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

    const handleRiskAssessment = e => {
      setParams(this.props.history, { riskAssessmentId: e.value });
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
            label="Risk Assessment"
            field={'riskAssessmentId'}
            clearable={!!queryParams.riskAssessmentId}
          >
            <SelectWithRiskAssessment
              name="riskAssessmentId"
              label="Select risk assessment"
              initialValue={queryParams?.riskAssessmentId}
              onSelect={handleRiskAssessment}
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
            field={['from', 'to']}
            clearable={queryParams?.from || queryParams?.to}
          >
            <CustomRangeContainer>
              <DateContainer>
                <DateControl
                  name="from"
                  value={generateQueryParamsDate(queryParams?.from)}
                  placeholder="select from date "
                  onChange={e => dateOrder(e, 'from')}
                />
              </DateContainer>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="to"
                    value={generateQueryParamsDate(queryParams?.to)}
                    placeholder="select to date "
                    onChange={e => dateOrder(e, 'to')}
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
        title="Form Submissions"
        icon="/images/actions/25.svg"
        description=""
      />
    );

    const updatedProps = {
      title: 'Submissions',
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
