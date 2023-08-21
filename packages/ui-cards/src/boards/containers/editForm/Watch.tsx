import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IItem, IOptions, WatchMutation, WatchVariables } from '../../types';
import { Alert, renderWithProps } from '@erxes/ui/src/utils';
import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Watch from '../../components/editForm/Watch';

type IProps = {
  item: IItem;
  options: IOptions;
  isSmall?: boolean;
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
