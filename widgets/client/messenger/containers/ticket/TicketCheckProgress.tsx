import * as React from "react";

import TicketCheckProgress from "../../components/ticket/TicketCheckProgress";
import { useRouter } from "../../context/Router";

type Props = {
  loading?: boolean;
};

const TicketCheckProgressContainer = (props: Props) => {
  const { setRoute } = useRouter();

  const onButtonClick = () => {
    console.log("hereee");
    setRoute("ticket-progress");
  };

  return <TicketCheckProgress handleButtonClick={onButtonClick} />;
};

export default TicketCheckProgressContainer;
