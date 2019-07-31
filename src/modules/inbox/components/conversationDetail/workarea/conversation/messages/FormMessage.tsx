import dayjs from 'dayjs';
import Table from 'modules/common/components/table';
import React from 'react';
import { IMessage } from '../../../../../types';
import { FormTable } from '../styles';

type Props = {
  message: IMessage;
};

export default class FormMessage extends React.Component<Props, {}> {
  displayValue(data) {
    if (data.validation === 'date') {
      return dayjs(data.value).format('YYYY/MM/DD');
    }

    return data.value;
  }

  renderRow(data, index: string) {
    return (
      <tr key={index}>
        <td style={{ width: '40%' }}>
          <b>{data.text}:</b>
        </td>
        <td style={{ width: '60%' }}>{this.displayValue(data)}</td>
      </tr>
    );
  }

  render() {
    const { formWidgetData, content } = this.props.message;

    return (
      <FormTable>
        <Table striped={true}>
          <thead>
            <tr>
              <th className="text-center" colSpan={2}>
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
