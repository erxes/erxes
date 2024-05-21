import { InnerWidgetHandler } from "../styles";
import React, { useState, useEffect } from "react";
import Icon from "@erxes/ui/src/components/Icon";
import Tip from "@erxes/ui/src/components/Tip";

const InnerWidget = () => {
  const [innerWidgetShow, setInnerWidgetShow] = useState(true);
  const messengerDiv = document.getElementById("erxes-messenger-container");
  const callsDiv = document.getElementById("callsInnerWidget");
  const [haveMessenger, sethaveMessenger] = useState(false);

  useEffect(() => {
    if (!innerWidgetShow) {
      messengerDiv?.classList.add("hidden");
      callsDiv?.classList.add("hidden");
    } else {
      messengerDiv?.classList.remove("hidden");
      callsDiv?.classList.remove("hidden");
    }
  }, [innerWidgetShow]);

  setTimeout(() => {
    if (document.getElementById("erxes-messenger-container")) {
      sethaveMessenger(true);
    }
  }, 3000);

  const innerWidgetHandler = () => {
    setInnerWidgetShow(!innerWidgetShow);
  };

  return (
    <>
      {innerWidgetShow ? (
        <InnerWidgetHandler
          $show={innerWidgetShow}
          $double={callsDiv}
          $hide={!haveMessenger && !callsDiv}
        >
          <Tip text="Hide widget" placement="top">
            <Icon icon="cancel" size={8} onClick={innerWidgetHandler} />
          </Tip>
        </InnerWidgetHandler>
      ) : (
        <InnerWidgetHandler $show={innerWidgetShow}>
          <Tip text="Show widget" placement="left">
            <Icon icon="leftarrow-3" onClick={innerWidgetHandler} />
          </Tip>
        </InnerWidgetHandler>
      )}
    </>
  );
};

export default InnerWidget;
