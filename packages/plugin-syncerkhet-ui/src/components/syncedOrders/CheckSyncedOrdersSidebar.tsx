import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { __, router } from '@erxes/ui/src/utils';
import FormControl from '@erxes/ui/src/components/form/Control';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
}

interface State {
  posToken: string;
  paidStartDate: Date;
  paidEndDate: Date;
  createdStartDate: Date;
  createdEndDate: Date;
}

class CheckerSidebar extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    const { queryParams } = this.props;
    this.state = {
      posToken: queryParams.posToken,
      paidStartDate: queryParams.paidStartDate,
      paidEndDate: queryParams.paidEndDate,
      createdStartDate: queryParams.createdStartDate,
      createdEndDate: queryParams.createdEndDate
    };
  }
  setFilter = (name, value) => {
    router.setParams(this.props.history, { [name]: value });
  };

  onFilter = () => {
    const {
      posToken,
      paidStartDate,
      paidEndDate,
      createdStartDate,
      createdEndDate
    } = this.state;

    router.setParams(this.props.history, {
      page: 1,
      posToken,
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
      <>
        <FormGroup>
          <ControlLabel>{`${dateType} Date range:`}</ControlLabel>

          <Datetime
            inputProps={{ placeholder: __('Click to select a date') }}
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
        </FormGroup>
        <FormGroup>
          <ControlLabel>{`${dateType} Date range:`}</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __('Click to select a date') }}
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
        </FormGroup>
      </>
    );
  }

  render() {
    const { posToken } = this.state;
    const onChangePosToken = (e: any) => {
      const token = e.target?.value;
      this.setState({ posToken: token });
    };
    return (
      <Wrapper.Sidebar>
        <Sidebar>
          <Section collapsible={false}>
            <Section.Title>{__('Filters')}</Section.Title>
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
            {this.renderRange('paid')}
            {this.renderRange('created')}
          </Section>

          <Button onClick={this.onFilter}>Filter</Button>
        </Sidebar>
      </Wrapper.Sidebar>
    );
  }
}

export default CheckerSidebar;
