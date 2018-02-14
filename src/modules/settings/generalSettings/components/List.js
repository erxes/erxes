import React, { Component } from 'react';
import { Wrapper } from 'modules/layout/components';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select-plus';
import { FormGroup } from 'modules/common/components';
import { currency, measurements } from '../constants';
import { ContentBox, SubHeading } from '../../styles';

class List extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.selectCurrencyChange = this.selectCurrencyChange.bind(this);
    this.selectUOMChange = this.selectUOMChange.bind(this);
  }

  getInitialState() {
    return {
      removeSelected: true,
      value: [],
      data: []
    };
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

    const content = (
      <ContentBox>
        <Row>
          <Col md={5}>
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
          </Col>
        </Row>
      </ContentBox>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
      />
    );
  }
}

export default List;
