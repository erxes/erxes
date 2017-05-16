import gql from 'graphql-tag';
import Subscriber from './Subscriber';


export default class NotificationSubscriber extends Subscriber {
  subscribeToMoreOptions() {
    return {
      document: gql`subscription notification {notification}`,
      updateQuery: () => {
        this.props.data.refetch();
      },
    };
  }
}
