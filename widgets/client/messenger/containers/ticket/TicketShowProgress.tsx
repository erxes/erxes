import * as React from "react";

import { TICKET_ACTIVITY_LOGS, TICKET_COMMENTS } from "../../graphql/queries";
import { useMutation, useQuery } from "@apollo/client";

import { TICKET_COMMENTS_ADD } from "../../graphql/mutations";
import TicketShowProgress from "../../components/ticket/TicketShowPropgress";
import { useTicket } from "../../context/Ticket";

type Props = {
  loading: boolean;
};

const TicketShowProgressContainer = (props: Props) => {
  const { ticketData } = useTicket();
  const [comment, setComment] = React.useState("");

  const {
    data,
    loading: commentsLoading,
    error,
    refetch: commentQueryRefetch,
  } = useQuery(TICKET_COMMENTS, {
    variables: {
      typeId: ticketData._id,
      type: "ticket",
    },
    fetchPolicy: "network-only",
  });

  const [commentsAdd, { loading }] = useMutation(TICKET_COMMENTS_ADD, {
    onCompleted() {
      commentQueryRefetch();
    },
    onError(error) {
      return alert(error.message);
    },
  });

  const {
    data: activityData,
    loading: activityLoading,
    error: activityError,
  } = useQuery(TICKET_ACTIVITY_LOGS, {
    variables: {
      contentType: "tickets:ticket",
      contentId: ticketData._id,
    },
    fetchPolicy: "network-only",
  });

  const onSubmit = () => {
    return commentsAdd({
      variables: {
        type: "ticket",
        typeId: ticketData._id,
        content: comment,
        userType: "client",
      },
    });
  };

  if (activityLoading || commentsLoading) {
    return <div className="loader" />;
  }

  return (
    <TicketShowProgress
      activityLogs={activityData.activityLogs || []}
      setComment={setComment}
      handleSubmit={onSubmit}
    />
  );
};

export default TicketShowProgressContainer;
