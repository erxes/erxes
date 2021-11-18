import React from 'react';
import { Icon, __ } from 'erxes-ui';
import Select from 'react-select-plus';
import dayjs from 'dayjs';

type Props = {
  columns: any[];
  column: string;
  fields: any[];
  columnWithChosenField: any;
  onChangeColumn: (columnm, value) => void;
};

class Row extends React.Component<Props, {}> {
  renderSampleDatas = () => {
    const { column, columns } = this.props;

    const sampleDatas = columns[column];

    return sampleDatas.map(sample => {
      return <li key={Math.random()}>{sample}</li>;
    });
  };

  onChange = ({ value }) => {
    const { column } = this.props;

    this.props.onChangeColumn(column, value);
  };

  renderMatch = () => {
    const { column, columns, columnWithChosenField, fields } = this.props;
    const chosenColumn = columnWithChosenField[column];

    let matched = true;

    if (!chosenColumn) {
      return <Icon icon="checked" color="green" />;
    }

    const sampleDatas = columns[column];

    console.log(sampleDatas);

    const chosenField = fields.find(
      field => field.value === chosenColumn.value
    );

    console.log(chosenField);

    sampleDatas.map(sample => {
      if (chosenField.type === 'date') {
        if (!dayjs(sample).isValid()) {
          matched = false;
        }
      }

      if (chosenField.label && chosenField.label.includes('Email')) {
        console.log('asdakdj');
        const re = /\S+@\S+\.\S+/;

        if (!re.test(sample)) {
          matched = false;
        }
      }
    });

    if (matched) {
      return <Icon icon="checked" color="green" />;
    }

    return <Icon icon="exclamation-triangle" color="yellow" />;
  };

  render() {
    const { fields, columnWithChosenField, column } = this.props;

    return (
      <tr>
        <td>{this.props.column}</td>
        <td>{this.renderSampleDatas()}</td>
        <td>
          <div>
            <Select
              placeholder={__('Choose')}
              options={fields}
              onChange={this.onChange}
              clearable={false}
              value={
                columnWithChosenField[column]
                  ? columnWithChosenField[column].value
                  : ''
              }
            />
            {this.renderMatch()}
          </div>
        </td>
      </tr>
    );
  }
}

export default Row;
