import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../components/Form';
import { mutations } from '../graphql';

type Props = {
  contentType: string;
};

type State = {};

type FinalProps = {
  importHistoriesCreate: any;
} & Props;

class FormContainer extends React.Component<FinalProps, State> {
  render() {
    const { importHistoriesCreate } = this.props;

    const addImportHistory = doc => {
      const { contentTypes } = doc;

      importHistoriesCreate({
        variables: doc
      }).then(() => {
        window.location.href = `/settings/importHistories?type=${contentTypes[0]}`;
      });
    };

    return (
      <Form
        contentType={this.props.contentType}
        addImportHistory={addImportHistory}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.importHistoriesCreate), {
      name: 'importHistoriesCreate'
    })
  )(FormContainer)
);
