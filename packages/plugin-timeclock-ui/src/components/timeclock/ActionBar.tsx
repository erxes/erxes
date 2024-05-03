import { ColoredSquare, FlexColumn, FlexRowLeft } from "../../styles";

import Button from "@erxes/ui/src/components/Button";
import { COLORS } from "../../constants";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import React from "react";
import { getEnv } from "@erxes/ui/src/utils";
import queryString from "query-string";

type Props = {
  queryParams: any;
  currentUserId: string;
  isCurrentUserAdmin: boolean;
};

const TimeclockActionBarLeft = ({
  queryParams,
  currentUserId,
  isCurrentUserAdmin,
}: Props) => {
  const exportPage = () => {
    const stringified = queryString.stringify({
      ...queryParams,
      currentUserId,
      isCurrentUserAdmin,
    });

    const { REACT_APP_API_URL } = getEnv();
    window.open(
      `${REACT_APP_API_URL}/pl:timeclock/timeclock-export?${stringified}`
    );
  };

  return (
    <FlexRowLeft style={{ gap: "2rem", margin: "0 1rem" }}>
      <FlexRowLeft style={{ gap: "1rem" }}>
        <FlexColumn $marginNum={10}>
          <FlexRow>
            <ColoredSquare color={COLORS.paidAbsence} />
            <div>Paid Absence</div>
          </FlexRow>
          <FlexRow>
            <ColoredSquare color={COLORS.unpaidAbsence} />
            <div>Unpaid Absence</div>
          </FlexRow>
          <FlexRow>
            <ColoredSquare color={COLORS.shiftRequest} />
            <div>Shift request</div>
          </FlexRow>
        </FlexColumn>
        <FlexColumn $marginNum={10}>
          <FlexRow>
            <ColoredSquare color={COLORS.absent} />
            <div>Absent</div>
          </FlexRow>
          <FlexRow>
            <ColoredSquare color="rgba(255,88,87,0.2)" />
            <div>Shift active</div>
          </FlexRow>
          <FlexRow>
            <ColoredSquare color={COLORS.shiftNotClosed} />
            <div>Shift not closed</div>
          </FlexRow>
        </FlexColumn>
      </FlexRowLeft>

      <div>
        <Button onClick={exportPage} icon="export" btnStyle="primary">
          Export page
        </Button>
      </div>
    </FlexRowLeft>
  );
};

export default TimeclockActionBarLeft;
