import React from 'react';
import moment from 'moment';
import { Label } from 'react-bootstrap';
import { Row as CommonRow } from '../../common/components';
import { BrandForm } from './';

class Row extends CommonRow {
  renderForm(props) {
    return <BrandForm {...props} />;
  }

  render() {
    const { object } = this.props;

    return (
      <tr>
        <td>{object.name}</td>
        <td><Label>{object.code}</Label></td>
        <td>{object.description}</td>
        <td>{moment(object.createdAt).format('DD MMM YYYY')}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
