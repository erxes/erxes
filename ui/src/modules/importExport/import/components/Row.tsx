import React from 'react';
import { Button, Icon, Tip, __ } from 'erxes-ui';
import Select from 'react-select-plus';
import dayjs from 'dayjs';
import { FlexRow, ImportColumnRow } from 'modules/importExport/styles';

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
      return <p key={Math.random()}>{`${sample}, `} &nbsp;</p>;
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

    const chosenField = fields.find(
      field => field.value === chosenColumn.value
    );

    for (const sample of sampleDatas) {
      if (chosenField.type === 'date') {
        if (!dayjs(sample).isValid()) {
          matched = false;
        }
      }

      if (chosenField.label && chosenField.label.includes('Email')) {
        const re = /\S+@\S+\.\S+/;

        if (!re.test(sample)) {
          matched = false;
        }
      }
    }

    if (matched) {
      return <Icon icon="checked-1" color="green" />;
    }

    return (
      <Tip text="ALDAA GARCH MAGADGVI">
        <Icon icon="exclamation-triangle" color="orange" />
      </Tip>
    );
  };

  render() {
    const { fields, columnWithChosenField, column } = this.props;

    return (
      <ImportColumnRow>
        <td>{this.props.column}</td>
        <td>
          <FlexRow>{this.renderSampleDatas()}</FlexRow>
        </td>
        <td>
          <FlexRow>
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
            <Button size="small">Create Property</Button>
            {this.renderMatch()}
          </FlexRow>
        </td>
      </ImportColumnRow>
    );
  }
}

export default Row;
