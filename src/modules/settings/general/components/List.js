import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper, ActionBar } from 'modules/layout/components';
import Select from 'react-select-plus';
import { FormGroup, Button, ControlLabel } from 'modules/common/components';
import { CURRENCIES, MEASUREMENTS, LANGUAGES } from '../constants';
import { ContentBox } from '../../styles';

const propTypes = {
  save: PropTypes.func.isRequired,
  currencies: PropTypes.array,
  uom: PropTypes.array
};

class List extends Component {
  constructor(props, context) {
    super(props);

    this.state = {
      currencies: props.currencies,
      uom: props.uom,
      language: context.currentLanguage || 'en'
    };

    this.onCurrenciesChange = this.onCurrenciesChange.bind(this);
    this.onUOMChange = this.onUOMChange.bind(this);
    this.onLanguageChange = this.onLanguageChange.bind(this);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save('dealCurrency', this.state.currencies);
    this.props.save('dealUOM', this.state.uom);
  }

  onCurrenciesChange(currencies) {
    this.setState({ currencies: currencies.map(el => el.value) });
  }

  onUOMChange(uom) {
    this.setState({ uom: uom.map(el => el.value) });
  }

  onLanguageChange(language) {
    this.setState({ language });
    this.context.changeLanguage(language.value);
  }

  render() {
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General') }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/">
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>

            <Button
              size="small"
              btnStyle="success"
              onClick={this.save}
              icon="checked-1"
            >
              Save
            </Button>
          </Button.Group>
        }
      />
    );

    const content = (
      <ContentBox>
        <FormGroup>
          <ControlLabel>Language</ControlLabel>
          <Select
            options={LANGUAGES}
            value={this.state.language}
            onChange={this.onLanguageChange}
            searchable={false}
            clearable={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Currency</ControlLabel>
          <Select
            options={CURRENCIES}
            value={this.state.currencies}
            removeSelected={this.state.removeSelected}
            onChange={this.onCurrenciesChange}
            multi
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Unit of measurement</ControlLabel>
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

List.propTypes = propTypes;
List.contextTypes = {
  changeLanguage: PropTypes.func,
  currentLanguage: PropTypes.string,
  __: PropTypes.func
};

export default List;
