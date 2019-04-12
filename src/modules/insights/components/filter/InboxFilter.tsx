import { Button, ControlLabel } from 'modules/common/components';
import { ISelectedOption } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import * as React from 'react';
import Select from 'react-select-plus';
import { FlexItem } from '../../styles';
import { IQueryParams } from '../../types';
import { integrationOptions, selectOptions } from '../../utils';
import Filter from './Filter';

type Props = {
  brands: IBrand[];
  queryParams: IQueryParams;
  history: any;
};

type States = {
  integrationType: string;
  integrationIds: string[];
  brandIds: string[];
};

class InboxFilter extends React.Component<Props, States> {
  constructor(props) {
    super(props);
    const { brandIds = '', integrationIds = '' } = props.queryParams || {};
    this.state = {
      ...props.queryParams,
      brandIds: brandIds.split(','),
      integrationIds: integrationIds.split(',')
    };
  }

  onTypeChange = (integrations: ISelectedOption[]) => {
    this.setState({ integrationIds: integrations.map(el => el.value) });
  };

  onBrandChange = (brands: ISelectedOption[]) => {
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
    const { queryParams, history } = this.props;

    const content = (
      <>
        {this.renderIntegrations()}
        {this.renderBrands()}
      </>
    );

    const applyBtn = (
      <Button btnStyle="success" icon="apply" onClick={this.onApplyClick}>
        Apply
      </Button>
    );

    return (
      <Filter
        queryParams={queryParams}
        history={history}
        content={content}
        applyBtn={applyBtn}
      />
    );
  }
}

export default InboxFilter;
