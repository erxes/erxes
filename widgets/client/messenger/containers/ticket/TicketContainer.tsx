import * as React from "react";

import Ticket from "../../components/ticket/Ticket";
import { useRouter } from "../../context/Router";

type Props = {
  loading: boolean;
};

const TicketContainer = (props: Props) => {
  const { setRoute } = useRouter();
  const [activeRoute, handleActiveRoute] = React.useState("ticket-submit");
  const [isCheck, setIsCheck] = React.useState(false);

  const onSubmit = (name: string) => {
    handleActiveRoute(name);
  };

  const onButtonClick = () => {
    !isCheck && setRoute(activeRoute);
  };

  const renderCheckForm = () => {
    return (
      <div className="ticket-check-container">
        <div className="line-wrapper">
          <div className="line" />
        </div>
        hi
      </div>
    );
  };

  return (
    <div className={`ticket-main-container ${isCheck ? "active" : ""}`}>
      <Ticket
        activeRoute={activeRoute}
        loading={props.loading}
        handleSubmit={onSubmit}
        setIsCheck={setIsCheck}
        handleButtonClick={onButtonClick}
      />
      <div className="ticket-overlay"></div>
      {renderCheckForm()}
    </div>
  );
};

export default TicketContainer;
