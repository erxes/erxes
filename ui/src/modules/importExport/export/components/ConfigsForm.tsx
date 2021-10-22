import FormGroup from 'modules/common/components/form/Group';
import _ from 'lodash';

import React from 'react';
import { FormControl } from 'modules/common/components/form';
import { OperatorList } from 'modules/segments/components/styles';
import { __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { SubHeading } from 'modules/settings/styles';
import { FormColumn, FormWrapper } from 'erxes-ui/lib/styles/main';

type Props = {
  columns: any[];
  searchValue: string;
  onSearch: (e) => void;
  onClickField: (checked, field) => void;
};

class ConfigsForm extends React.Component<Props, {}> {
  groupByType = results => {
    return results.reduce((acc, field) => {
      const value = field.name;
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

  renderFields = fields => {
    const onClickField = (e, field) => {
      this.props.onClickField(e.target.checked, field);
    };

    return fields.map(field => {
      return (
        <FormControl
          key={Math.random()}
          id={String(fields._id)}
          defaultChecked={fields.checked}
          componentClass="checkbox"
          onChange={e => onClickField(e, field)}
          checked={field.checked}
        >
          {field.label}
        </FormControl>
      );
    });
  };

  renderOperators = results => {
    const objects = this.groupByType(results);

    return Object.keys(objects).map(key => {
      return (
        <FormColumn key={Math.random()}>
          <OperatorList>
            <FormGroup>
              <b>{key}</b>
              {this.renderFields(objects[key])}
            </FormGroup>
          </OperatorList>
        </FormColumn>
      );
    });
  };

  render() {
    const { columns, searchValue } = this.props;

    const condition = new RegExp(searchValue, 'i');

    const results = columns.filter(field => {
      return condition.test(field.label);
    });

    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <FormGroup>
            <SubHeading>{__('Properties to export')}</SubHeading>

            <FormControl
              placeholder={__('Search')}
              onChange={this.props.onSearch}
            />
          </FormGroup>

          <FormWrapper>{this.renderOperators(results)}</FormWrapper>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default ConfigsForm;
