import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { __, router } from '@erxes/ui/src/utils';
import FormControl from '@erxes/ui/src/components/form/Control';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { CustomRangeContainer, FilterContainer } from '../../styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { EndDateContainer } from '@erxes/ui-forms/src/forms/styles';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  posList?: any[];
}

interface State {
  posToken: string;
  paidStartDate: Date;
  paidEndDate: Date;
  createdStartDate: Date;
  createdEndDate: Date;
  search: string;
  userId: string;
  posId: string;
}

class CheckerSidebar extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    const { queryParams } = this.props;
    this.state = {
      posToken: queryParams.posToken,
      search: queryParams.search,
      paidStartDate: queryParams.paidStartDate,
      paidEndDate: queryParams.paidEndDate,
      createdStartDate: queryParams.createdStartDate,
      createdEndDate: queryParams.createdEndDate,
      userId: queryParams.user,
      posId: queryParams.pos
    };
  }

  onFilter = () => {
    const {
      posToken,
      search,
      posId,
      userId,
      paidStartDate,
      paidEndDate,
      createdStartDate,
      createdEndDate
    } = this.state;

    router.setParams(this.props.history, {
      page: 1,
      posToken,
      search,
      pos: posId,
      user: userId,
      paidStartDate,
      paidEndDate,
      createdStartDate,
      createdEndDate
    });
  };

  onChangeRangeFilter = (kind, date) => {
    const cDate = dayjs(date).format('YYYY-MM-DD HH:mm');
    this.setState({ [kind]: cDate } as any);
  };

  renderRange(dateType: string) {
    const lblStart = `${dateType}StartDate`;
    const lblEnd = `${dateType}EndDate`;

    return (
      <FormGroup>
        <ControlLabel>{`${dateType} Date range:`}</ControlLabel>
        <CustomRangeContainer>
          <DateContainer>
            <Datetime
              inputProps={{ placeholder: __('Choose Date') }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={this.state[lblStart] || null}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={this.onChangeRangeFilter.bind(this, lblStart)}
              viewMode={'days'}
              className={'filterDate'}
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <Datetime
                inputProps={{ placeholder: __('Choose Date') }}
                dateFormat="YYYY-MM-DD"
                timeFormat="HH:mm"
                value={this.state[lblEnd]}
                closeOnSelect={true}
                utc={true}
                input={true}
                onChange={this.onChangeRangeFilter.bind(this, lblEnd)}
                viewMode={'days'}
                className={'filterDate'}
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
      </FormGroup>
    );
  }

  render() {
    const { posList } = this.props;
    const { posToken, search, userId, posId } = this.state;
    const onChangePosToken = (e: any) => {
      const token = e.target?.value;
      this.setState({ posToken: token });
    };

    const onChangeInput = (e: React.FormEvent<HTMLElement>) => {
      const value = (e.currentTarget as HTMLInputElement).value;
      const name = (e.currentTarget as HTMLInputElement).name;
      this.setState({ [name]: value } as any);
    };

    const onUserChange = userId => {
      this.setState({ userId });
    };

    return (
      <Wrapper.Sidebar hasBorder={true}>
        <Section.Title>{__('Filters')}</Section.Title>
        <FilterContainer>
          <FormGroup>
            <ControlLabel>Enter POS token</ControlLabel>
            <FormControl
              type="text"
              placeholder={__('POS token')}
              onChange={onChangePosToken}
              defaultValue={posToken}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Created by</ControlLabel>
            <SelectTeamMembers
              label="Choose users"
              name="userId"
              customOption={{ label: 'Choose user', value: '' }}
              initialValue={userId || ''}
              onSelect={onUserChange}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>POS</ControlLabel>
            <FormControl
              name={'posId'}
              componentClass="select"
              defaultValue={posId}
              onChange={onChangeInput}
            >
              <option value="">{__('All')}</option>
              {posList &&
                Array.isArray(posList) &&
                (posList || []).map(pos => (
                  <option
                    key={pos._id}
                    value={pos._id}
                  >{`${pos.name} - ${pos.description}`}</option>
                ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Number</ControlLabel>
            <FormControl
              type="text"
              name="search"
              onChange={onChangeInput}
              defaultValue={search}
              autoFocus={true}
            />
          </FormGroup>
          {this.renderRange('paid')}
          {this.renderRange('created')}

          <Button
            block={true}
            btnStyle="success"
            uppercase={false}
            onClick={this.onFilter}
            icon="filter"
          >
            {__('Filter')}
          </Button>
        </FilterContainer>
      </Wrapper.Sidebar>
    );
  }
}

export default CheckerSidebar;
