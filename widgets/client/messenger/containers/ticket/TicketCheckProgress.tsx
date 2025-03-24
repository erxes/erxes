import * as React from "react";

import {
  TICKET_CHECK_PROGRESS,
  TICKET_CHECK_PROGRESS_FORGET,
} from "../../graphql/mutations";

import TicketCheckProgress from "../../components/ticket/TicketCheckProgress";
import { useMutation } from "@apollo/client";
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

  const [ticketCheck, { loading: ticketCheckLoading }] = useMutation(
    TICKET_CHECK_PROGRESS,
    {
      fetchPolicy: "no-cache",
      onCompleted(data) {
        setTicketData(data.ticketCheckProgress);
        data && setRoute("ticket-progress");
      },
      onError(error) {
        return alert(error.message);
      },
    }
  );

  const [ticketForget, { loading: forgetLoading }] = useMutation(
    TICKET_CHECK_PROGRESS_FORGET,
    {
      fetchPolicy: "no-cache",
      onCompleted(data) {
        setTicketData(data.ticketCheckProgressForget);
        data && setRoute("ticket-forget");
      },
      onError(error) {
        return alert(error.message);
      },
    }
  );

  const onButtonClick = () => {
    return ticketCheck({
      variables: {
        number,
      },
      fetchPolicy: "network-only",
    });
  };

  const onForget = () => {
    return ticketForget({
      variables: {
        email,
        phoneNumber,
      },
      fetchPolicy: "network-only",
    });
  };

  if (ticketCheckLoading || forgetLoading) {
    return <div className="loader" />;
  }

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
