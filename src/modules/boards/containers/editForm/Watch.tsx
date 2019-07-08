import gql from 'graphql-tag';
import {
  IItem,
  IOptions,
  WatchMutation,
  WatchVariables
} from 'modules/boards/types';
import { Alert, renderWithProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Watch } from '../../components/editForm';

type IProps = {
  item: IItem;
  options: IOptions;
};

type FinalProps = {
  watchMutation: WatchMutation;
} & IProps;

class WatchContainer extends React.Component<FinalProps> {
  render() {
    const onChangeWatch = (isAdd: boolean) => {
      const { watchMutation, options, item } = this.props;

      watchMutation({ variables: { _id: item._id, isAdd } })
        .then(() => {
          Alert.success(options.texts.changeSuccessText);
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      onChangeWatch
    };

    return <Watch {...updatedProps} />;
  }
}

export default (props: IProps) => {
  const { options } = props;

  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, WatchMutation, WatchVariables>(
        gql(options.mutations.watchMutation),
        {
          name: 'watchMutation',
          options: ({ item }: { item: IItem }) => ({
            refetchQueries: [
              {
                query: gql(options.queries.detailQuery),
                variables: { _id: item._id }
              }
            ]
          })
        }
      )
    )(WatchContainer)
  );
};
