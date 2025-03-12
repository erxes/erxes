import * as React from "react";

import TicketSubmitForm from "../../components/ticket/TicketSubmitForm";
import { useRouter } from "../../context/Router";

type Props = {
  loading: boolean;
};

const TicketSubmitContainer = (props: Props) => {
  const { setRoute } = useRouter();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSubmit = () => {
    setIsSubmitted(true);
  };

  const onButtonClick = () => {
    setRoute("home");
  };

  return (
    <TicketSubmitForm
      isSubmitted={isSubmitted}
      loading={props.loading}
      handleSubmit={onSubmit}
      handleButtonClick={onButtonClick}
    />
  );
};

export default TicketSubmitContainer;
