import React from 'react';
import { ColoredSquare, FlexColumn, FlexRowLeft } from '../../styles';
import { COLORS } from '../../constants';
import { FlexRow } from '@erxes/ui-settings/src/styles';

const TimeclockActionBarLeft = () => {
  return (
    <FlexRowLeft>
      <FlexColumn>
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
      <FlexColumn>
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
  );
};

export default TimeclockActionBarLeft;
