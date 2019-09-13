import gql from 'graphql-tag';
import { queries } from 'modules/forms/graphql';
import { FormsQueryResponse } from 'modules/forms/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
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
