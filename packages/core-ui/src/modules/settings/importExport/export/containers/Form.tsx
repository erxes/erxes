import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { mutations } from '../../graphql';
import { Alert, withProps } from 'modules/common/utils';

type Props = {};

type FinalProps = {
  fieldsQuery: any; //check
  exportHistoriesCreate: any;
} & Props;

type State = {
  loading: boolean;
  count: string;
  exportName: string;
};

class FormContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      count: '',
      exportName: ''
    };
  }

  render() {
    const { exportHistoriesCreate } = this.props;
    const { count, loading } = this.state;

    const saveExport = doc => {
      exportHistoriesCreate({
        variables: doc
      })
        .then(() => {
          Alert.success('You successfully exported');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    return (
      <Form
        {...this.props}
        count={count}
        loading={loading}
        saveExport={saveExport}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.exportHistoriesCreate), {
      name: 'exportHistories'
    })
  )(FormContainer)
);
