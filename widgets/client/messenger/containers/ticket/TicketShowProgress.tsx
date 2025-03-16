import * as React from "react";

import TicketShowProgress from "../../components/ticket/TicketShowPropgress";
import { useRouter } from "../../context/Router";

type Props = {
  loading: boolean;
};

const TicketShowProgressContainer = (props: Props) => {
  const { setRoute } = useRouter();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSubmit = () => {
    setIsSubmitted(true);
  };

  const onButtonClick = () => {
    setRoute("home");
  };

  return (
    <TicketShowProgress
      isSubmitted={isSubmitted}
      loading={props.loading}
      handleSubmit={onSubmit}
      handleButtonClick={onButtonClick}
    />
  );
};

export default TicketShowProgressContainer;
