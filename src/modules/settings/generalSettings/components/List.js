import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper, ActionBar } from 'modules/layout/components';
import Select from 'react-select-plus';
import { FormGroup, Button } from 'modules/common/components';
import { currency, measurement } from '../constants';
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
    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'General Settings' }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/general-settings">
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
        <SubHeading>Currency</SubHeading>
        <FormGroup>
          <Select
            options={currency}
            value={this.state.currencies}
            removeSelected={this.state.removeSelected}
            onChange={this.onCurrenciesChange}
            multi
          />
        </FormGroup>

        <SubHeading>Unit of measurement</SubHeading>
        <FormGroup>
          <Select
            options={measurement}
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

export default List;
