import * as React from "react";

import Call from "../../components/call/Call";
import { useRouter } from "../../context/Router";

const CallContainer = () => {
  const { setRoute } = useRouter();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSubmit = () => {
    setIsSubmitted(true);
  };

  const onButtonClick = () => {
    setRoute("home");
  };

  return (
    <Call
      isSubmitted={isSubmitted}
      handleSubmit={onSubmit}
      handleNextButton={onButtonClick}
    />
  );
};

export default CallContainer;
