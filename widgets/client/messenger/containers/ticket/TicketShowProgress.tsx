import * as React from "react";

import { TICKET_ACTIVITY_LOGS, TICKET_COMMENTS } from "../../graphql/queries";
import { useMutation, useQuery } from "@apollo/client";

import { TICKET_COMMENTS_ADD } from "../../graphql/mutations";
import TicketShowProgress from "../../components/ticket/TicketShowPropgress";
import { useRouter } from "../../context/Router";
import { useTicket } from "../../context/Ticket";

type Props = {
  loading: boolean;
};

const TicketShowProgressContainer = (props: Props) => {
  const { ticketData } = useTicket();
  const { ticketCheckProgress } = ticketData || {};

  const [comment, setComment] = React.useState("");

  const {
    data,
    loading: commentsLoading,
    error,
    refetch: commentQueryRefetch,
  } = useQuery(TICKET_COMMENTS, {
    variables: {
      typeId: ticketCheckProgress._id,
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
      contentId: ticketCheckProgress._id,
    },
    fetchPolicy: "network-only",
  });

  const onSubmit = () => {
    return commentsAdd({
      variables: {
        type: "ticket",
        typeId: ticketCheckProgress._id,
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
