import {
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  Wrapper,
  router,
  Tip,
  Icon,
  SelectCustomers,
  SelectTeamMembers,
  SelectCompanies
} from '@erxes/ui/src';
import { DateContainer, ScrollWrapper } from '@erxes/ui/src/styles/main';
import React from 'react';
import {
  ClearBtnContainer,
  PaddingTop,
  FilterRowContainer
} from '../../../styles';

interface LayoutProps {
  children: React.ReactNode;
  label: string;
  clearable: boolean;
  type: string;
}
interface VObject {
  fromDate: string;
  toDate: string;
  orderType: string;
  order: string;
  ownerType: string;
  ownerId: string;
}

type State = {
  variables: VObject;
};

type Props = {
  loadingMainQuery: boolean;
  history: any;
  queryParams: any;
  refetch: (variable: any) => void;
};

class SideBar extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      variables: this.props?.queryParams
    };
  }

  render() {
    const { refetch, history } = this.props;
    const { variables } = this.state;

    const handleClear = (e: any, type: string) => {
      router.removeParams(history, type);
      variables[type] = '';
      refetch(variables);
      // this.setState({variables:variables})
    };

    const handleValue = (e: any) => {
      const target = e.currentTarget as HTMLInputElement;
      const name = target.name;
      const value = target.value;
      const result = { ...variables, [name]: value };
      this.setState({ variables: result });
      router.setParams(history, { [name]: value });
      name !== 'orderType' && refetch(result);
    };

    const handleDate = (e: any, type: string) => {
      const result = { ...variables, [type]: String(e) };
      this.setState({ variables: result });
      router.setParams(history, { [type]: String(e) });

      refetch(result);
    };

    const checkParams = type => {
      return router.getParam(history, type) ? true : false;
    };

    const handleOwnerId = e => {
      const result = { ...variables, ownerId: String(e) };
      this.setState({ variables: result });
      router.setParams(history, { ownerId: String(e) });
      refetch(result);
    };
    const renderOwner = () => {
      if (variables.ownerType === 'customer') {
        return (
          <SelectCustomers
            label="Team Members"
            name="ownerId"
            multi={false}
            initialValue={variables?.ownerId}
            onSelect={handleOwnerId}
          />
        );
      }
      if (variables.ownerType === 'user') {
        return (
          <SelectTeamMembers
            label="Team Members"
            name="ownerId"
            multi={false}
            initialValue={variables?.ownerId}
            onSelect={handleOwnerId}
          />
        );
      }
      return (
        <SelectCompanies
          label="Compnay"
          name="ownerId"
          multi={false}
          initialValue={variables?.ownerId}
          onSelect={handleOwnerId}
        />
      );
    };

    const Form = (props: LayoutProps) => (
      <FormGroup>
        <ControlLabel>{props.label}</ControlLabel>
        <FilterRowContainer>
          {props.children}
          {props.clearable && (
            <ClearBtnContainer
              tabIndex={0}
              onClick={e => handleClear(e, props.type)}
            >
              <Tip text={'Clear filter'} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </ClearBtnContainer>
          )}
        </FilterRowContainer>
      </FormGroup>
    );

    const SideBarFilter = () => {
      return (
        <ScrollWrapper>
          <Wrapper.Sidebar.Section.Title>
            Addition filters
          </Wrapper.Sidebar.Section.Title>
          <Form
            label="Owner Type"
            clearable={checkParams('ownerType')}
            type="ownerType"
          >
            <FormControl
              name="ownerType"
              componentClass="select"
              value={variables?.ownerType}
              required={true}
              onChange={handleValue}
            >
              <option key={'customer'} value={'customer'}>
                {'customer'}
              </option>
              <option key={'user'} value={'user'}>
                {'user'}
              </option>
              <option key={'company'} value={'company'}>
                {'company'}
              </option>
            </FormControl>
          </Form>
          <Form label="Owner" clearable={checkParams('ownerId')} type="ownerId">
            {renderOwner()}
          </Form>
          <Form
            label="Order Type"
            clearable={checkParams('orderType')}
            type="orderType"
          >
            <FormControl
              name="orderType"
              componentClass="select"
              value={variables?.orderType}
              placeholder={'Select Order Type'}
              required={true}
              onChange={handleValue}
            >
              <option key={'Date'} value={'createdAt'}>
                {'Date'}
              </option>
              <option key={'Changed Score'} value={'changeScore'}>
                {'Changed Score'}
              </option>
            </FormControl>
          </Form>
          <Form label="Order" clearable={checkParams('order')} type="order">
            <FormControl
              name="order"
              componentClass="select"
              value={variables?.order}
              placeholder={'Select Order'}
              required={true}
              onChange={handleValue}
              disabled={!variables?.orderType}
            >
              <option key={'Ascending'} value={1}>
                {'Ascending'}
              </option>
              <option key={'Descending'} value={-1}>
                {'Descending'}
              </option>
            </FormControl>
          </Form>
          <Form
            label="From"
            clearable={checkParams('fromDate')}
            type="fromDate"
          >
            <DateContainer>
              <DateControl
                required={true}
                name="startDate"
                placeholder={'Choose start date'}
                value={variables?.fromDate}
                onChange={e => handleDate(e, 'fromDate')}
              />
            </DateContainer>
          </Form>
          <Form label="To" clearable={checkParams('toDate')} type="toDate">
            <DateContainer>
              <DateControl
                required={true}
                name="fromDate"
                placeholder={'Choose from date'}
                value={variables?.toDate}
                onChange={e => handleDate(e, 'toDate')}
              />
            </DateContainer>
          </Form>
        </ScrollWrapper>
      );
    };
    return (
      <Wrapper.Sidebar>
        <PaddingTop>
          <SideBarFilter />
        </PaddingTop>
      </Wrapper.Sidebar>
    );
  }
}

export default SideBar;
