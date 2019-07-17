import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Settings from '../components/Settings';
import { mutations, queries } from '../graphql';

type FinalProps = {
  engagesConfigDetailQuery: any;
  engagesConfigSaveMutation: any;
};

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { engagesConfigDetailQuery, engagesConfigSaveMutation } = this.props;

    // create or update action
    const save = (secretAccessKey, accessKeyId) => {
      engagesConfigSaveMutation({
        variables: { secretAccessKey, accessKeyId }
      })
        .then(() => {
          Alert.success('You successfully updated general settings');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      save,
      ses: engagesConfigDetailQuery.engagesConfigDetail || {}
    };

    //tslint:disable
    console.log(engagesConfigDetailQuery);

    return <Settings {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}>(gql(queries.engagesConfigDetail), {
      name: 'engagesConfigDetailQuery'
    }),
    graphql<{}>(gql(mutations.engagesConfigSave), {
      name: 'engagesConfigSaveMutation'
    })
  )(SettingsContainer)
);
