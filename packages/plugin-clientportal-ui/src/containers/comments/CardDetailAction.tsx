import { Alert, confirm } from "@erxes/ui/src/utils";
import { mutations, queries } from "../../graphql";
import { useMutation, useQuery } from "@apollo/client";

import { AppConsumer } from "coreui/appContext";
import Detail from "../../components/comments/CardDetailAction";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import { gql } from "@apollo/client";

type Props = {
  item: any;
  currentUser?: IUser;
};

function DetailContainer({ item, currentUser }: Props) {
  const {
    stage: { type = "" },
  } = item;

  const {
    data,
    loading,
    refetch: cpCommentsRefetch,
  } = useQuery(gql(queries.clientPortalComments), {
    variables: { typeId: item._id, type },
    skip: !type,
  });

  const {
    data: widgetDatas,
    loading: widgetCommentsLoading,
    refetch: widgetCommentsRefetch,
  } = useQuery(gql(queries.widgetComments), {
    variables: { typeId: item._id, type },
    skip: !type,
  });

  const cpComments = data?.clientPortalComments || [];
  const widgetComments = widgetDatas?.widgetsTicketComments || [];

  const [createComment] = useMutation(gql(mutations.clientPortalCommentsAdd), {
    onCompleted() {
      cpCommentsRefetch();
    },
    onError(error) {
      return Alert.error(error.message);
    },
  });

  const [createWidgetComment] = useMutation(gql(mutations.widgetCommentsAdd), {
    onCompleted() {
      widgetCommentsRefetch();
    },
    onError(error) {
      return Alert.error(error.message);
    },
  });

  const [deleteComment] = useMutation(
    gql(mutations.clientPortalCommentsRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.clientPortalComments),
          variables: { typeId: item._id, type },
        },
      ],
    }
  );

  const handleSubmit = (values: { content: string }) => {
    createComment({
      variables: {
        ...values,
        typeId: item._id,
        type: "ticket",
        userType: "team",
      },
    });
  };

  const handleWidgetSubmit = (values: { content: string }) => {
    createWidgetComment({
      variables: {
        ...values,
        typeId: item._id,
        type: "ticket",
        userType: "team",
        customerId: currentUser ? currentUser._id : item.createdUser?._id || "",
      },
    });
  };

  const handleRemoveComment = (commentId: string) => {
    confirm().then(() =>
      deleteComment({
        variables: {
          _id: commentId,
        },
      })
    );
  };

  if (type !== "ticket") {
    return null;
  }

  const updatedProps = {
    cpComments,
    widgetComments,
    loading,
    handleSubmit,
    handleRemoveComment,
    handleWidgetSubmit,
  };

  return <Detail {...updatedProps} />;
}

function CardDetailActionWrapper({ item }: { item: any }) {
  return (
    <AppConsumer>
      {({ currentUser }) => {
        return <DetailContainer item={item} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
}

export default CardDetailActionWrapper;
