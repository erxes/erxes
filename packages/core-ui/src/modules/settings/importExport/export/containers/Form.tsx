import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';
import { Alert, withProps } from 'modules/common/utils';

type Props = {
  contentType: string;
};

type FinalProps = {
  fieldsQuery: any;
  exportHistoriesCreate: any;
} & Props;

type State = {
  loading: boolean;
  count: string;
  name: string;
};

class FormContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      count: '',
      name: ''
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

          window.location.href = `/settings/exportHistories?type=${doc.contentType}`;
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
      name: 'exportHistoriesCreate'
    })
  )(FormContainer)
);
