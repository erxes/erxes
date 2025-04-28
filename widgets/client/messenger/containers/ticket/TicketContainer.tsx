import * as React from "react";

import AcquireInformation from "../../components/AcquireInformation";
import Ticket from "../../components/ticket/Ticket";
import TicketCheckProgressContainer from "./TicketCheckProgress";
import { connection } from "../../connection";
import { getUiOptions } from "../../utils/util";
import { useConversation } from "../../context/Conversation";
import { useRouter } from "../../context/Router";

type Props = {
  loading: boolean;
};

const TicketContainer = (props: Props) => {
  const submitTicketRoute = connection.data.customerId
    ? "ticket-submit"
    : "create-customer";

  const { setRoute } = useRouter();
  const { saveGetNotified } = useConversation();

  const [activeRoute, handleActiveRoute] = React.useState(submitTicketRoute);
  const [isCheck, setIsCheck] = React.useState(false);
  const [createCustomer, setCreateCustomer] = React.useState(false);
  const [isForget, setIsForget] = React.useState(false);

  const onSubmit = (name: string) => {
    handleActiveRoute(name);
  };

  const onButtonClick = () => {
    activeRoute === "check"
      ? setIsCheck(true)
      : activeRoute === "create-customer"
        ? setCreateCustomer(true)
        : setRoute(activeRoute);
  };

  const renderCheckForm = () => {
    return (
      <div
        className={`ticket-check-container ${isForget ? "forgotten" : ""} ${isCheck ? "active" : ""}`}
      >
        <div className="line-wrapper">
          <div className="line" />
        </div>
        <TicketCheckProgressContainer
          isForget={isForget}
          setIsForget={setIsForget}
        />
      </div>
    );
  };

  const onCustomerAdd = ({ type, value }: { type: string; value: string }) => {
    saveGetNotified(
      { type, value },
      () => {},
      () => {
        setRoute("ticket-submit");
      }
    );
  };

  const renderCustomerAddForm = () => {
    if (!createCustomer) return null;

    return (
      <div
        className={`ticket-auth-container ${createCustomer ? "active" : ""}`}
      >
        <div className="line-wrapper">
          <div className="line" />
        </div>
        <AcquireInformation
          color={getUiOptions().color}
          textColor={getUiOptions().textColor || "#fff"}
          save={onCustomerAdd}
          loading={false}
        />
      </div>
    );
  };

  return (
    <div
      className={`ticket-main-container ${isCheck || createCustomer ? "active" : ""}`}
    >
      <Ticket
        activeRoute={activeRoute}
        loading={props.loading}
        handleSubmit={onSubmit}
        handleButtonClick={onButtonClick}
      />
      <div
        className="ticket-overlay"
        onClick={() =>
          createCustomer
            ? setCreateCustomer(!createCustomer)
            : setIsCheck(!isCheck)
        }
      ></div>
      {renderCheckForm()}
      {renderCustomerAddForm()}
    </div>
  );
};

export default TicketContainer;
