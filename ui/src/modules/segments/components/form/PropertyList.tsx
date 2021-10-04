import FormGroup from 'modules/common/components/form/Group';
import _ from 'lodash';
import { IField } from 'modules/segments/types';
import React from 'react';
import { FormControl } from 'modules/common/components/form';
import { OperatorList } from '../styles';

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
          value && value.includes('.')
            ? value.substr(0, value.indexOf('.'))
            : 'general';

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
          componentClass="radio"
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
      return (
        <OperatorList key={Math.random()}>
          <FormGroup>
            <b>{key}</b>
            {this.renderFields(objects[key])}
          </FormGroup>
        </OperatorList>
      );
    });
  }
}

export default PropertyList;
