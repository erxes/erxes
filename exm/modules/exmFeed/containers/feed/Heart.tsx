import { mutations, queries } from "../../graphql";
import { useMutation, useQuery } from "@apollo/client";

import Alert from "../../../utils/Alert";
import Heart from "../../components/feed/Heart";
import React from "react";
import gql from "graphql-tag";

type Props = {
  _id: string;
};

export default function ListContainer(props: Props) {
  const { _id } = props;

  const variables = {
    contentId: _id,
    contentType: "exmFeed",
    type: "heart",
  };

  const emojiCountResponse = useQuery(gql(queries.emojiCount), {
    variables,
  });

  const emojiIsReactedResponse = useQuery(gql(queries.emojiIsReacted), {
    variables,
  });

  const [heartMutation] = useMutation(gql(mutations.emojiReact));

  const handleHearted = () => {
    heartMutation({
      variables: { contentId: _id, contentType: "exmFeed", type: "heart" },
      refetchQueries: [
        {
          query: gql(queries.emojiCount),
          variables,
        },
        {
          query: gql(queries.emojiIsReacted),
          variables,
        },
      ],
    }).catch((error) => {
      Alert.error(error.message);
    });
  };

  return (
    <Heart
      handleHearted={handleHearted}
      totalCount={emojiCountResponse?.data?.emojiCount || 0}
      emojiIsReacted={emojiIsReactedResponse?.data?.emojiIsReacted || false}
    />
  );
}
