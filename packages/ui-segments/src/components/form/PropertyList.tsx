import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IField } from "../../types";
import { OperatorList } from "../styles";
import React from "react";
import _ from "lodash";

type Props = {
  contentType: string;
  fields: IField[];
  onClickProperty: (field: IField) => void;
};

class PropertyList extends React.Component<Props, {}> {
  groupByType = () => {
    const { fields = [] } = this.props;

    return fields.reduce((acc, field) => {
      const value = field.value;
      let key;

      if (field.group) {
        key = field.group;
      } else {
        key =
          value && value.includes(".")
            ? value.substr(0, value.indexOf("."))
            : "general";

        key = _.startCase(key);
      }

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(field);

      return acc;
    }, {});
  };

  onClickProperty = field => {
    this.props.onClickProperty(field);
  };

  renderFields = fields => {
    return fields.map(field => {
      return (
        <FormControl
          key={Math.random()}
          componentclass="radio"
          onChange={this.onClickProperty.bind(this, field)}
        >
          {field.label}
        </FormControl>
      );
    });
  };

  render() {
    const objects = this.groupByType();

    return Object.keys(objects).map(key => {
      let groupName = key;
      const groupDetail = (objects[key] || []).find(
        ({ group }) => group === key
      )?.groupDetail;

      if (groupDetail) {
        groupName = groupDetail?.name || key;
      }

      return (
        <OperatorList key={Math.random()}>
          <FormGroup>
            <b>{groupName}</b>
            {this.renderFields(objects[key])}
          </FormGroup>
        </OperatorList>
      );
    });
  }
}

export default PropertyList;
