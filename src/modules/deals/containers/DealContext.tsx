import client from 'apolloClient';
import gql from 'graphql-tag';
import debounce from 'lodash/debounce';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { mutations } from '../graphql';

type IStore = {
  changeBackground: (id: string, color: any) => void;
  backgroundColor?: string;
};

const DealContext = React.createContext({} as IStore);

export const DealConsumer = DealContext.Consumer;

type State = {
  backgroundColor: string;
};

export default class DealProvider extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = { backgroundColor: '' };
  }

  changeBackground = (id, { hex }: { id: string; hex: string }) => {
    this.setState({ backgroundColor: hex }, () => {
      debounce(
        () => this.saveChangeBackground({ _id: id, backgroundColor: hex }),
        1000
      )();
    });
  };

  saveChangeBackground = (variables: {
    _id: string;
    backgroundColor: string;
  }) => {
    client
      .mutate({
        mutation: gql(mutations.changeBackground),
        variables
      })
      .catch((e: Error) => {
        Alert.error(e.message);
      });
  };

  render() {
    const contextProps = {
      backgroundColor: this.state.backgroundColor || '',
      changeBackground: this.changeBackground
    };

    return (
      <DealContext.Provider value={contextProps}>
        {this.props.children}
      </DealContext.Provider>
    );
  }
}
