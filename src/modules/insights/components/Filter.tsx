import { Button, ControlLabel } from 'modules/common/components';
import { router } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import * as moment from 'moment';
import * as React from 'react';
import * as Datetime from 'react-datetime';
import Select from 'react-select-plus';
import { IBrand } from '../../settings/brands/types';
import { FlexItem, FlexRow, InsightFilter, InsightTitle } from '../styles';
import { IQueryParams } from '../types';
import { integrationOptions, selectOptions } from '../utils';

type Props = {
  brands: IBrand[];
  queryParams: IQueryParams;
  history: any;
};

type States = {
  isChange: boolean;
  integrationType: string;
  integrationIds: string[];
  brandIds: string[];
  startDate: Date;
  endDate: Date;
};

class Filter extends React.Component<Props, States> {
  constructor(props) {
    super(props);
    const {
      startDate = moment().add(-7, 'days'),
      endDate = moment(),
      brandIds = '',
      integrationIds = ''
    } = props.queryParams || {};
    this.state = {
      ...props.queryParams,
      // check condition for showing placeholder
      isChange: false,
      brandIds: brandIds.split(','),
      integrationIds: integrationIds.split(',')
    };
  }

  onTypeChange = (integrations: any) => {
    this.setState({ integrationIds: integrations.map(el => el.value) });
  };

  onBrandChange = (brands: any) => {
    this.setState({ brandIds: brands.map(el => el.value) });
  };

  onApplyClick = () => {
    const { history } = this.props;
    const { integrationIds, brandIds } = this.state;

    router.setParams(history, {
      integrationIds: (integrationIds || []).join(','),
      brandIds: (brandIds || []).join(',')
    });
  };

  onDateInputChange = (type: string, date) => {
    if (type === 'endDate') {
      this.setState({ endDate: date, isChange: true });
    } else {
      this.setState({ startDate: date, isChange: true });
    }
  };

  onFilterByDate = (type: string, date) => {
    if (this.state.isChange) {
      const formatDate = date ? moment(date).format('YYYY-MM-DD HH:mm') : null;
      router.setParams(this.props.history, { [type]: formatDate });
    }
  };

  renderIntegrations() {
    const integrations = INTEGRATIONS_TYPES.ALL_LIST;

    const options = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    return (
      <FlexItem>
        <ControlLabel>Integrations</ControlLabel>
        <Select
          placeholder={__('Choose integrations')}
          value={this.state.integrationIds || []}
          onChange={this.onTypeChange}
          optionRenderer={options}
          options={integrationOptions([__('All'), ...integrations])}
          multi={true}
        />
      </FlexItem>
    );
  }

  renderBrands() {
    const { brands } = this.props;

    const options = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    return (
      <FlexItem>
        <ControlLabel>Brands</ControlLabel>

        <Select
          placeholder={__('Choose brands')}
          value={this.state.brandIds || []}
          onChange={this.onBrandChange}
          optionRenderer={options}
          options={selectOptions([{ _id: '', name: __('All') }, ...brands])}
          multi={true}
        />
      </FlexItem>
    );
  }

  render() {
    const props = {
      inputProps: { placeholder: 'Click to select a date' },
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY/MM/DD'
    };

    return (
      <InsightFilter>
        <InsightTitle>{__('Filter')}</InsightTitle>
        <FlexRow>
          {this.renderIntegrations()}
          {this.renderBrands()}
          <FlexItem>
            <ControlLabel>Start date</ControlLabel>
            <Datetime
              {...props}
              value={this.state.startDate}
              onBlur={this.onFilterByDate.bind(this, 'startDate')}
              onChange={this.onDateInputChange.bind(this, 'startDate')}
            />
          </FlexItem>
          <FlexItem>
            <ControlLabel>End date</ControlLabel>
            <Datetime
              {...props}
              value={this.state.endDate}
              onBlur={this.onFilterByDate.bind(this, 'endDate')}
              onChange={this.onDateInputChange.bind(this, 'endDate')}
            />
          </FlexItem>
          <Button btnStyle="success" icon="apply" onClick={this.onApplyClick}>
            Apply
          </Button>
        </FlexRow>
      </InsightFilter>
    );
  }
}

export default Filter;
