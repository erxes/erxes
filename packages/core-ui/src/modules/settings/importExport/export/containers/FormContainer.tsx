import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  contentType: string;
};

type State = {};

type FinalProps = {
  exportHistoriesCreate: any;
} & Props;

class FormContainer extends React.Component<FinalProps, State> {
  render() {
    const { exportHistoriesCreate } = this.props;

    const addExportHistory = doc => {
      const { contentTypes } = doc;

      exportHistoriesCreate({
        variables: doc
      }).then(() => {
        window.location.href = `/settings/importHistories?type=${contentTypes[0].contentType}`;
      });
    };

    return (
      <Form
        contentType={this.props.contentType}
        addExportHistory={addExportHistory}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.exportHistoriesCreate), {
      name: 'exportHistoriesCreate'
    }),
    graphql<Props>(gql(queries.exportHistoryGetTypes), {
      name: 'exportHistoryGetTypes'
    })
  )(FormContainer)
);
