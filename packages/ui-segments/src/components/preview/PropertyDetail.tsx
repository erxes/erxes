import { ConditionDetailText, PropertyText } from "../styles";
import { DEFAULT_OPERATORS, OPERATORS } from "../constants";

import { ISegmentCondition } from "../../types";
import React from "react";
import { gql, useQuery } from "@apollo/client";
import Spinner from "@erxes/ui/src/components/Spinner";

type Props = {
  condition: ISegmentCondition;
  field: any;
  segmentKey: string;
  onClickProperty: (field, condition, segmentKey) => void;
};

const SelectionConfigLabel = ({ selectionConfig, propertyValue }) => {
  const { queryName, labelField, valueField = "_id" } = selectionConfig;

  if (!queryName && !labelField) {
    return propertyValue;
  }

  const query = `
    query ${queryName}($ids: [String]) {
      ${queryName}(ids: $ids) {
        ${labelField},${valueField}
      }
    }
  `;

  const ids = propertyValue.includes(",")
    ? propertyValue.split(",")
    : [propertyValue];

  const { data, loading } = useQuery(gql(query), {
    variables: { ids },
  });

  if (loading) {
    return <Spinner objective />;
  }

  const list = (data || {})[queryName] || [];

  if (!list?.length) {
    return propertyValue;
  }

  return `${list.map((item) => item[labelField]).join(", ")}`;
};

class PropertyDetail extends React.Component<Props, {}> {
  onClickProperty = () => {
    const { field, onClickProperty, condition, segmentKey } = this.props;

    onClickProperty(field, condition, segmentKey);
  };

  renderOperator = () => {
    const { condition, field } = this.props;

    const { type } = field;
    const { propertyOperator } = condition;

    const operators = OPERATORS[type || ""] || DEFAULT_OPERATORS;
    const operator = (operators || []).find((op) => {
      return op.value === propertyOperator;
    });

    return operator ? operator.name : "";
  };

  renderValue = () => {
    const { condition, field } = this.props;

    const {
      selectOptions = [],
      choiceOptions = [],
      selectionConfig,
      type,
    } = field;
    const { propertyValue = "" } = condition;

    let text = propertyValue;

    if (
      ["dateigt", "dateilt", "drlt", "drgt"].includes(
        condition.propertyOperator || ""
      )
    ) {
      text = `${new Date(propertyValue).toDateString()} ${new Date(
        propertyValue
      ).toTimeString()}`;
    }

    if (selectionConfig) {
      const updatedProps = {
        selectionConfig,
        propertyValue,
      };
      return <SelectionConfigLabel {...updatedProps} />;
    }

    if (selectOptions.length > 0) {
      const option = (selectOptions || []).find((selectOption) => {
        return selectOption.value === propertyValue;
      });

      text = option ? option.label : text;
    }

    if (type === "radio" && choiceOptions.length > 0) {
      const option = (choiceOptions || []).find((choiceOption) => {
        return choiceOption === propertyValue;
      });

      text = option ? option : text;
    }

    return text;
  };

  render() {
    const { condition, field } = this.props;

    const { label, group } = field;
    const { propertyOperator, propertyType = "" } = condition;

    const operator = this.renderOperator();

    const value = this.renderValue();

    let propertyTypeText = propertyType.replace("_", " ");
    let valueText = (
      <span>
        {` ${operator} `} {value}
      </span>
    );

    if (propertyType === "form_submission") {
      propertyTypeText = group;
    }

    if (
      propertyOperator &&
      ["is", "ins", "it", "if"].indexOf(propertyOperator) >= 0
    ) {
      valueText = <span>{` ${operator}`}</span>;
    }

    if (
      propertyOperator &&
      ["wobm", "woam", "wobd", "woad"].indexOf(propertyOperator) >= 0
    ) {
      valueText = (
        <span>
          {` `}
          {value}
          {` ${operator}`}
        </span>
      );
    }

    return (
      <ConditionDetailText>
        <span>{`${propertyTypeText}'s`} </span>
        <PropertyText onClick={this.onClickProperty}>{label}</PropertyText>
        {valueText}
      </ConditionDetailText>
    );
  }
}

export default PropertyDetail;
