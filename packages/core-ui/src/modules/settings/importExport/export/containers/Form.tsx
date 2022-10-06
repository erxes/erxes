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
  exportHistoriesCreate: (contentType) => Promise<void>;
} & Props;

class FormContainer extends React.Component<
  FinalProps,
  { loading: boolean; count: string }
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      count: ''
    };
  }

  render() {
    const { exportHistoriesCreate } = this.props;
    const { count, loading } = this.state;

    const saveExport = (
      contentType: string,
      columnsConfig: any[],
      segmentData: any[]
    ) => {
      exportHistoriesCreate({
        variables: {
          contentType: contentType,
          columnsConfig: columnsConfig,
          segmentData: segmentData
        }
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
