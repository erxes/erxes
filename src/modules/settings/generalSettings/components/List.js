import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper, ActionBar } from 'modules/layout/components';
import Select from 'react-select-plus';
import { FormGroup, Button } from 'modules/common/components';
import { currency } from '../constants';
import { ContentBox, SubHeading } from '../../styles';
import _ from 'underscore';

class List extends Component {
  constructor(props) {
    super(props);

    this.state = { value: this.props.currencyValue };

    this.selectCurrencyChange = this.selectCurrencyChange.bind(this);
    this.selectUOMChange = this.selectUOMChange.bind(this);
    this.save = this.save.bind(this);
  }

  getInitialState() {
    return {
      removeSelected: true,
      value: this.props.currencyValue,
      data: []
    };
  }

  save(e) {
    e.preventDefault();

    this.props.save(this.state.value);
  }

  selectCurrencyChange(data) {
    const value = _.pluck(data, 'value');

    this.setState({ value });
  }

  selectUOMChange(data) {
    this.setState({ data });
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
            value={this.state.value}
            removeSelected={this.state.removeSelected}
            onChange={this.selectCurrencyChange}
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
  currencyValue: PropTypes.array
};

export default List;
