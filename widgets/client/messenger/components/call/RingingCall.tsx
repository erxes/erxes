import * as React from "react";

import { CloudflareCallDataDepartment } from "../../../types";
import Container from "../common/Container";
import { IconCallEnd } from "../../../icons/Icons";
import { __ } from "../../../utils";

type IProps = {
  stopCall: ({ seconds }: { seconds: number }) => void;
  onBack: (isCalling: boolean) => void;
  activeDepartment: CloudflareCallDataDepartment;
};

const RingingCallComponent: React.FC<IProps> = ({
  stopCall,
  onBack,
  activeDepartment,
}) => {
  const stop = () => {
    if (stopCall) {
      stopCall({ seconds: 0 });
    }
  };

  return (
    <Container
      title={__("Ongoing call")}
      withBottomNavBar={false}
      onBackButton={() => onBack(false)}
    >
      <div className="call-container">
        <div className="outgoing-call">
          <div>
            <h2>{activeDepartment && activeDepartment.name}</h2>
            <span>Calling...</span>
          </div>
          <button onClick={() => stop()} className="cancel-call-btn">
            <IconCallEnd size="35px" />
          </button>
        </div>
      </div>
    </Container>
  );
};

export default RingingCallComponent;
