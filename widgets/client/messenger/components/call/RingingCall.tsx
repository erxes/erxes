import * as React from "react";

import Container from "../common/Container";
import { __ } from "../../../utils";

type IProps = {
  stopCall: ({ seconds }: { seconds: number }) => void;
};

const RingingCallComponent: React.FC<IProps> = ({ stopCall }) => {
  const stop = () => {
    if (stopCall) {
      stopCall({ seconds: 0 });
    }
  };

  return (
    <Container title={__("Call")} withBottomNavBar={false}>
      <div className="call-container">
        <div className="outgoing-call">
          <h2>Calling...</h2>
          <button onClick={() => stop()} className="cancel-call-btn">
            Cancel
          </button>
          <style>{`
        .outgoing-call {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        h2 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        .cancel-call-btn {
          background-color: red;
          color: white;
          margin: 10px;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .cancel-call-btn:hover {
          background-color: darkred;
        }
      `}</style>
        </div>
      </div>
    </Container>
  );
};

export default RingingCallComponent;
