import gql from 'graphql-tag';
import { Component } from 'react';
import { graphql } from 'react-apollo';

const SUBSCRIPTION = gql`
  subscription automationResponded {
    automationResponded {
      response
    }
  }
`;

class Test extends Component {
  componentWillMount() {
    console.log('jkdjkl');
  }
  render() {
    console.log('a', this.props);
    return 'Test';
  }
}

export default graphql(SUBSCRIPTION)(Test);

// import React from 'react';
// import Response from '../components/Response';
// import { AutomationConsumer } from '../context';

// // const ResponseContainer = () => {
// //   const kk = client.subscribe({ query: '' });
// //   console.log(kk);
// // }

// // const subscription = gql(subscriptions.automationSubscription);

// // const ResponseContainer = () => (
// //   <Subscription
// //     subscription={subscription}
// //     variables={{userId: 'gQtsd8RuqdR5WmpL3'}}
// //   >
// //     {( { data, loading } ) => {
// //       console.log(loading, data);
// //       const updatedProps = {
// //         isLoading: loading,
// //         response: data ? data.response : ''
// //       };
// //       return <Response {...updatedProps} />;
// //     }}
// //   </Subscription>
// // )
// // type Props = {
// //   userId: string;
// // };

// // type FinalProps = {
// //   subbs: AutomationRespondedQueryResponse;
// // } & Props

// // class ResponseContainer extends React.Component<FinalProps> {
// //   render() {
// //     const { userId, subbs } = this.props

// //     const { loading, data } = subbs.subscribeToMore({
// //       document: subscription,
// //       variables: { userId },

// //       updateQuery: (prev, { subscriptionData: { dataz } }) => {
// //         console.log(prev, dataz);
// //       }
// //     })

// //     // const { loading, data } = useSubscription(subscription, { variables: { userId } });

// //     if (!loading) {
// //       return '';
// //     }

// //     if (!data.response){
// //       return '';
// //     }

// //     const updatedProps = {
// //       isLoading: loading,
// //       response: data.response
// //     };
// //     return <Response {...updatedProps} />;
// //   }
// // }

// // export default withProps<Props>(compose(
// //   graphql<{ userId: string}, AutomationRespondedQueryResponse, { userId: string }>(
// //     gql(subscriptions.automationSubscription),
// //     {
// //       name: 'subbs',
// //       options: ({ userId }) => ({
// //         variables: { userId }
// //       })
// //     }
// //   ))(ResponseContainer)
// // );

// const ResponseContainer = () => (
//   <AutomationConsumer>
//     {({ isLoading, response }) => {
//       const updatedProps = {
//         isLoading,
//         response
//       };
//       return <Response {...updatedProps} />;
//     }}
//   </AutomationConsumer>
// );

// // type Props = {
// //   userId: string,
// // };

// // type FinalProps = {
// //   responseQuery: AutomationRespondedQueryResponse,
// //   isLoading: boolean
// // } & Props;

// // class ResponseContainer extends React.Component<FinalProps> {
// //   private prevSubscriptions;

// //   constructor(props) {
// //     super(props);

// //     this.prevSubscriptions = null;
// //   }

// //   componentWillReceiveProps(nextProps) {
// //     const { responseQuery, userId } = this.props;
// //     this.prevSubscriptions.handler = responseQuery.subscribeToMore({
// //       document: gql(subscriptions.automationSubscription),
// //       variables: { userId },
// //       updateQuery: () => {
// //         this.props.responseQuery.refetch();
// //       }
// //     })
// //   }

// //   render () {
// //     console.log(subscriptions.automationSubscription);
// //     console.log(this.props);
// //     const { response } = this.props
// //     const updatedProps = {
// //       isLoading: true,
// //       response
// //     };
// //     return <Response {...updatedProps} />;
// //   }

// // }

// export default ResponseContainer;
