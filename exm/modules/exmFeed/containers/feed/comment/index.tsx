import { mutations, queries } from "../../../graphql";

import ButtonMutate from "../../../../common/ButtonMutate";
import CommentComponent from "../../../components/feed/comment";
import { IButtonMutateProps } from "../../../../common/types";
import React from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

const Comments: React.FC<{ contentId: string }> = ({ contentId }) => {
  const { data, loading, error, refetch } = useQuery(gql(queries.comments), {
    variables: {
      contentId,
      contentType: "exmFeed",
    },
  });

  const renderButton = ({ values, isSubmitted, callback }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.commentAdd}
        variables={values}
        refetchQueries={["comments"]}
        type="submit"
        isSubmitted={isSubmitted}
        icon="send"
        children=""
        successMessage="You successfully write a comment"
        callback={callback}
      />
    );
  };

  return (
    <CommentComponent
      renderButton={renderButton}
      data={data}
      loading={loading}
      refetch={refetch}
      error={error}
      contentId={contentId}
    />
  );
};

export default Comments;
