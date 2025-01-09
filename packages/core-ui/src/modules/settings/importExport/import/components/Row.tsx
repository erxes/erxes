import { FlexRow, ImportColumnRow } from "modules/settings/importExport/styles";

import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "modules/common/utils";
import Select from "react-select";
import dayjs from "dayjs";
import { IColumnWithChosenField, IImportColumn } from "../../types";
import { FieldsCombinedByType } from "@erxes/ui-forms/src/settings/properties/types";

type Props = {
  columns: IImportColumn;
  column: string;
  fields: FieldsCombinedByType[];
  columnWithChosenField: IColumnWithChosenField;
  onChangeColumn: (column, value, contentType, columns) => void;
  contentType: string;
};

type State = {
  value: string;
}

class Row extends React.Component<Props, State> {
  renderSampleDatas = () => {
    const { column, columns } = this.props;

    const sampleDatas = columns[column];

    return sampleDatas.map((sample) => {
      return (
        <span key={Math.random()}>
          <li>{sample}</li>
        </span>
      );
    });
  };

  onChange = ({ value }) => {
    const { column, contentType, columns } = this.props;
    this.props.onChangeColumn(column, value, contentType, columns);
  };

  renderMatch = () => {
    const { column, columns, columnWithChosenField, fields, contentType } =
      this.props;

    if (columnWithChosenField[contentType]) {
      const chosenColumn = columnWithChosenField[contentType][column];

      let matched = true;

      if (!chosenColumn) {
        return <Icon icon="checked-1" color="green" />;
      }

      const sampleDatas = columns[column];

      const chosenField = fields.find(
        (field) => field.value === chosenColumn.value
      );

      for (const sample of sampleDatas) {
        if(chosenField) {
          if (chosenField.type === "date") {
            if (!dayjs(sample).isValid()) {
              matched = false;
            }
          }
  
          if (chosenField.label && chosenField.label.includes("Email")) {
            const re = /\S+@\S+\.\S+/;
  
            if (!re.test(sample)) {
              matched = false;
            }
          }
        }
      }

      if (matched) {
        return <Icon icon="checked-1" color="green" />;
      }

      return (
        <Tip text="Not matched">
          <Icon icon="exclamation-triangle" color="orange" />
        </Tip>
      );
    }

    return <Icon icon="checked-1" color="green" />;
  };

  render() {
    const { fields, columnWithChosenField, column, contentType } = this.props;

    const renderValue = () => {
      const chosenField = columnWithChosenField[contentType];


      if (!chosenField) {
        return "";
      }

      if (chosenField) {
        return renderOptions().find(option => option.value === (chosenField[column] && chosenField[column].value))
      }

      return "";
    };

    const renderOptions = () => {
      const options = [...fields];

      const chosenField = columnWithChosenField[contentType];

      if (!chosenField) {
        return options;
      }

      options.forEach((option) => {
        Object.keys(chosenField).forEach((key) => {
          if (chosenField[key].value === option.value) {
            option.disabled = true;
          }
        });
      });

      return options;
    };

    return (
      <ImportColumnRow>
        <td>{this.renderMatch()}</td>
        <td>{this.props.column}</td>
        <td>
          <>{this.renderSampleDatas()}</>
        </td>
        <td>
          <FlexRow>
            <Select
              placeholder={__("Choose")}
              options={renderOptions()}
              onChange={this.onChange}
              isClearable={false}
              value={renderValue()}
            />
          </FlexRow>
        </td>
      </ImportColumnRow>
    );
  }
}

export default Row;
