import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table } from 'modules/common/components';
import { FormTable } from '../styles';

const propTypes = {
  message: PropTypes.object.isRequired
};

export default class FormMessage extends React.Component {
  displayValue(data) {
    if (data.validation === 'date') {
      return moment(data.value).format('YYYY/MM/DD');
    }

    return data.value;
  }

  renderRow(data, index) {
    return (
      <tr key={index}>
        <td width="40%">
          <b>{data.text}:</b>
        </td>
        <td width="60%">{this.displayValue(data)}</td>
      </tr>
    );
  }

  render() {
    const { formWidgetData, content } = this.props.message;

    return (
      <FormTable>
        <Table striped>
          <thead>
            <tr>
              <th className="text-center" colSpan="2">
                {content}
              </th>
            </tr>
          </thead>
          <tbody>
            {formWidgetData.map((data, index) => this.renderRow(data, index))}
          </tbody>
        </Table>
      </FormTable>
    );
  }
}

FormMessage.propTypes = propTypes;
