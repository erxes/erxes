import React from 'react';
import { Icon, __ } from 'erxes-ui';
import Select from 'react-select-plus';

type Props = {
  columns: any[];
  column: string;
  fields: any[];
};

class Row extends React.Component<Props, {}> {
  renderSampleDatas = () => {
    const { column, columns } = this.props;

    const sampleDatas = columns[column];

    return sampleDatas.map(sample => {
      return <li key={Math.random()}>{sample}</li>;
    });
  };

  render() {
    const { fields } = this.props;
    return (
      <tr>
        <td>
          <Icon icon="checked" color="green" />
        </td>
        <td>{this.props.column}</td>
        <td>{this.renderSampleDatas()}</td>
        <td>
          <Select name="currency" placeholder={__('Choose')} options={fields} />
        </td>
      </tr>
    );
  }
}

export default Row;
