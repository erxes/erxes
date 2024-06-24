import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { IGrowthHack, VoteMutation, VoteVariables } from '../types';
import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { Vote } from '../components/editForm';
import { mutations, queries } from '../graphql';

type Props = {
  item: IGrowthHack;
  onUpdate: (item, prevStageId?: string) => void;
};

type FinalProps = {
  voteMutation: VoteMutation;
} & Props;

class VoteContainer extends React.Component<FinalProps> {
  render() {
    const onChangeVote = (isVote: boolean) => {
      const { voteMutation, item } = this.props;

      voteMutation({ variables: { _id: item._id, isVote } })
        .then(({ data: { growthHacksVote } }) => {
          Alert.success('You successfully changed an experiment');

          this.props.onUpdate(growthHacksVote);
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      onChangeVote
    };

    return <Vote {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, VoteMutation, VoteVariables>(
      gql(mutations.growthHacksVote),
      {
        name: 'voteMutation',
        options: ({ item }: { item: IGrowthHack }) => ({
          refetchQueries: [
            {
              query: gql(queries.growthHackDetail),
              variables: { _id: item._id }
            }
          ]
        })
      }
    )
  )(VoteContainer)
);
