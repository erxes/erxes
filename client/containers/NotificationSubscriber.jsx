import gql from 'graphql-tag';
import Subscriber from './Subscriber';


export default class NotificationSubscriber extends Subscriber {
  constructor(props) {
    super(props);

    this.subscribeToMoreOptions = {
      document: gql`subscription notification {notification}`,
      updateQuery: () => {
        this.props.data.refetch();
      },
    };
  }
}
