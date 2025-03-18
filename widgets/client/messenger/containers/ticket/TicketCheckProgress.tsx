import * as React from "react";

import { TICKET_CHECK_PROGRESS } from "../../graphql/queries";
import TicketCheckProgress from "../../components/ticket/TicketCheckProgress";
import { useQuery } from "@apollo/client";
import { useRouter } from "../../context/Router";
import { useTicket } from "../../context/Ticket";

type Props = {
  loading?: boolean;
};

const TicketCheckProgressContainer = (props: Props) => {
  const { setRoute } = useRouter();
  const { setTicketData } = useTicket();
  const [number, setNumber] = React.useState("");

  const { data, loading, error } = useQuery(TICKET_CHECK_PROGRESS, {
    variables: {
      number,
    },
    fetchPolicy: "network-only",
  });

  const onButtonClick = () => {
    setTicketData(data);
    data && setRoute("ticket-progress");
  };

  return (
    <TicketCheckProgress
      handleButtonClick={onButtonClick}
      setNumber={setNumber}
    />
  );
};

export default TicketCheckProgressContainer;
