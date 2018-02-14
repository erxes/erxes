import React, { Component } from 'react';
import { Wrapper } from 'modules/layout/components';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select-plus';
import { FormGroup } from 'modules/common/components';
import { timezones } from '../constants';
import { ContentBox, SubHeading } from '../../styles';

class List extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // timezone: props.prevOptions.timezone || ''
    };

    this.onTimezoneChange = this.onTimezoneChange.bind(this);
  }

  onTimezoneChange(e) {
    this.setState({ timezone: e.value });
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
              <Select options={timezones} clearable={false} />
            </FormGroup>

            <SubHeading>Unit of measurement</SubHeading>
            <FormGroup>
              <Select options={timezones} clearable={false} />
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
