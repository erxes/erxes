import * as React from "react";

import {
  TICKET_CHECK_PROGRESS,
  TICKET_CHECK_PROGRESS_FORGET,
} from "../../graphql/queries";

import TicketCheckProgress from "../../components/ticket/TicketCheckProgress";
import { useQuery } from "@apollo/client";
import { useRouter } from "../../context/Router";
import { useTicket } from "../../context/Ticket";

type Props = {
  loading?: boolean;
  isForget: boolean;
  setIsForget: (isForget: boolean) => void;
};

const TicketCheckProgressContainer = ({ isForget, setIsForget }: Props) => {
  const { setRoute } = useRouter();
  const { setTicketData } = useTicket();
  const [number, setNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhone] = React.useState("");

  const { data, loading, error } = useQuery(TICKET_CHECK_PROGRESS, {
    variables: {
      number,
    },
    fetchPolicy: "network-only",
  });

  const {
    data: forgetData,
    loading: forgetLoading,
    error: forgetError,
  } = useQuery(TICKET_CHECK_PROGRESS_FORGET, {
    variables: {
      email,
      phoneNumber,
    },
    fetchPolicy: "network-only",
  });

  const onButtonClick = () => {
    setTicketData(data);
    data && setRoute("ticket-progress");
  };

  const onForget = () => {
    if (forgetError) {
      alert(forgetError);
    }
  };

  // if (loading || forgetLoading) {
  //   return <div className="loader" />;
  // }

  return (
    <TicketCheckProgress
      handleButtonClick={onButtonClick}
      setNumber={setNumber}
      setIsForget={setIsForget}
      setEmail={setEmail}
      setPhone={setPhone}
      onForget={onForget}
      isForget={isForget}
    />
  );
};

export default TicketCheckProgressContainer;
