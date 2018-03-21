import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper, ActionBar } from 'modules/layout/components';
import Select from 'react-select-plus';
import { FormGroup, Button } from 'modules/common/components';
import { CURRENCIES, MEASUREMENTS } from '../constants';
import { ContentBox, SubHeading } from '../../styles';
import _ from 'underscore';

class List extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currencies: props.currencies,
      uom: props.uom
    };

    this.onCurrenciesChange = this.onCurrenciesChange.bind(this);
    this.onUOMChange = this.onUOMChange.bind(this);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();
    this.props.save('dealCurrency', this.state.currencies);
    this.props.save('dealUOM', this.state.uom);
  }

  onCurrenciesChange(data) {
    const currencies = _.pluck(data, 'value');
    this.setState({ currencies });
  }

  onUOMChange(data) {
    const uom = _.pluck(data, 'value');
    this.setState({ uom });
  }

  render() {
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General Settings') }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/">
              <Button size="small" btnStyle="simple" icon="close">
                Cancel
              </Button>
            </Link>

            <Button
              size="small"
              btnStyle="success"
              onClick={this.save}
              icon="checkmark"
            >
              Save
            </Button>
          </Button.Group>
        }
      />
    );

    const content = (
      <ContentBox>
        <SubHeading>{__('Currency')}</SubHeading>
        <FormGroup>
          <Select
            options={CURRENCIES}
            value={this.state.currencies}
            removeSelected={this.state.removeSelected}
            onChange={this.onCurrenciesChange}
            multi
          />
        </FormGroup>

        <SubHeading>{__('Unit of measurement')}</SubHeading>
        <FormGroup>
          <Select
            options={MEASUREMENTS}
            value={this.state.uom}
            removeSelected={this.state.removeSelected}
            onChange={this.onUOMChange}
            multi
          />
        </FormGroup>
      </ContentBox>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
        footer={actionFooter}
      />
    );
  }
}

List.propTypes = {
  save: PropTypes.func.isRequired,
  currencies: PropTypes.array,
  uom: PropTypes.array
};
List.contextTypes = {
  __: PropTypes.func
};

export default List;
