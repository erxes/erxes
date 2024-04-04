import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { queries } from '@erxes/ui-forms/src/forms/graphql';
import { FormsQueryResponse } from '@erxes/ui-forms/src/forms/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import FormList from '../components/FormList';

type Props = {
  onChangeForm: (stageId: string, value: string) => void;
  stage: any;
};

type FinalProps = {
  formsQuery: any;
} & Props;

class FormListContainer extends React.Component<FinalProps> {
  render() {
    const { formsQuery } = this.props;
    const forms = formsQuery.forms || [];

    const extendProps = {
      ...this.props,
      forms
    };

    return <FormList {...extendProps} />;
  }
}

export default compose(
  graphql<Props, FormsQueryResponse>(gql(queries.forms), {
    name: 'formsQuery'
  })
)(FormListContainer);
