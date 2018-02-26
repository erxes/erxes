import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper, ActionBar } from 'modules/layout/components';
import Select from 'react-select-plus';
import { FormGroup, Button } from 'modules/common/components';
import { currency, measurements } from '../constants';
import { ContentBox, SubHeading } from '../../styles';

class List extends Component {
  constructor(props) {
    super(props);

    this.state = { value: '' };

    this.selectCurrencyChange = this.selectCurrencyChange.bind(this);
    this.selectUOMChange = this.selectUOMChange.bind(this);
    this.save = this.save.bind(this);
  }

  getInitialState() {
    return {
      removeSelected: true,
      value: [],
      data: []
    };
  }

  save(e) {
    e.preventDefault();

    this.props.save(this.state);
  }

  selectCurrencyChange(value) {
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

        <SubHeading>Unit of measurement</SubHeading>
        <FormGroup>
          <Select
            multi
            options={measurements}
            value={this.state.data}
            removeSelected={this.state.removeSelected}
            onChange={this.selectUOMChange}
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
  save: PropTypes.func
};

export default List;
