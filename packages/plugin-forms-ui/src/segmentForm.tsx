import gql from 'graphql-tag';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Select from 'react-select-plus';
import React from 'react';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';

import Spinner from '@erxes/ui/src/components/Spinner';
import queries from './queries';
import { FormsQueryResponse } from '@erxes/ui-forms/src/forms/types';

type Props = {
  type: string;
  config: any;
  onChangeConfig?: (value) => void;
};

class Form extends React.Component<any, any, any> {
  onChangeForm = (_key, e) => {
    const formId = e ? e.value : '';

    console.log(e);

    const result = { formId };

    this.props.onChangeConfig(result);
  };

  render() {
    const { config, formsQuery } = this.props;

    if (formsQuery.loading) {
      return <Spinner />;
    }

    const { formId } = config;
    const forms = formsQuery.forms || [];

    if (forms[0] && !formId) {
      this.props.onChangeConfig({ formId: forms[0]._id });
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Form</ControlLabel>
          <Select
            value={formId}
            options={forms.map(b => ({ value: b._id, label: b.title }))}
            onChange={this.onChangeForm.bind(this, 'formId')}
          />
        </FormGroup>
      </>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, FormsQueryResponse, {}>(gql(queries.forms), {
      name: 'formsQuery'
    })
  )(Form)
);
