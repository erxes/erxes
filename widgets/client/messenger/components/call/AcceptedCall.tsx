import * as React from "react";

import { useEffect, useState } from "react";

import { CloudflareCallDataDepartment } from "../../../types";
import Container from "../common/Container";
import { IconCallEnd } from "../../../icons/Icons";
import { __ } from "../../../utils";

type Props = {
  stopCall: (seconds: number) => void;
  activeDepartment: CloudflareCallDataDepartment;
};

const AcceptedCallComponent = ({ stopCall, activeDepartment }: Props) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  };
  const stop = () => {
    stopCall(seconds);
  };

  return (
    <Container title={__("Call")} withBottomNavBar={false}>
      <div className="call-container">
        <div className="outgoing-call">
          <div>
            <h2>{activeDepartment && activeDepartment.name}</h2>
            <span>Call in Progress</span>
            <p className="call-duration">Duration: {formatTime()}</p>
          </div>
          <button onClick={() => stop()} className="cancel-call-btn">
            <IconCallEnd size="35px" />
          </button>
        </div>
      </div>
    </Container>
  );
};

export default AcceptedCallComponent;
