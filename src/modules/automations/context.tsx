import gql from 'graphql-tag';
// import * as compose from 'lodash.flowright';
// import { IUser } from 'modules/auth/types';
import React from 'react';
import { graphql, useSubscription } from 'react-apollo';
import { subscriptions } from './graphql';
// import { AutomationRespondedQueryResponse } from './types';

const subscription = gql(subscriptions.automationSubscription);

interface IStore {
  isLoading: boolean;
  response: any;
}

// type Props = {
//   automationResQuery: AutomationRespondedQueryResponse;
//   currentUser: IUser;
// };

const AutomationContext = React.createContext({} as IStore);

export const AutomationConsumer = AutomationContext.Consumer;

class Provider extends React.Component {
  componentWillMount() {
    // const {
    //   automationResQuery,
    //   currentUser
    // } = this.props;
    console.log('zbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');

    // const { loading, data } = useSubscription(subscription, { variables: { userId: 'gQtsd8RuqdR5WmpL3' } });
    const data = { response: ['fsdafsasfaaffas'] };
    const loading = true;
    console.log(loading, data);

    // automationResQuery.subscribeToMore({
    //   document: gql(subscriptions.automationSubscription),
    //   variables: { userId: currentUser ? currentUser._id : null },
    //   updateQuery: (prev, { subscriptionData: { dataz } }) => {
    //     const { automationResponded } = dataz;
    //     const { content } = automationResponded;
    //     const doc = document;
    //     doc.open();
    //     doc.write(content);
    //     automationResQuery.refetch();
    //   }
    // });
  }

  public render() {
    console.log('zaaaaaaaaaaaaaaaaaaaaaaaaaa');

    // const { loading, data } = useSubscription(subscription, { variables: { userId: 'gQtsd8RuqdR5WmpL3' } });
    // console.log(loading, data);
    const data = { response: ['fsdafsasfaaffas'] };
    const loading = true;
    console.log(loading, data);

    return (
      <AutomationContext.Provider
        value={{ response: data.response, isLoading: loading }}
      >
        {this.props.children}
      </AutomationContext.Provider>
    );
  }
}
export const AutomationProvider = graphql(subscription)(Provider);
// export const AutomationProvider = (Provider);
