import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const BurenscoringWrapper = styledTS<{ space: number }>(
  styled.div
)`padding-left: ${props => props.space * 20}px;
  display:inline-flex;
  justify-content:flex-start;
  align-items: center;
`;

type Props = {
  burenScoring: any;
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  render() {
    const { burenScoring} = this.props;
    return (
      <tr>
        <th>{burenScoring.score}</th>
        <th>{burenScoring?.customer?.firstname || ''}</th>
        <th>{burenScoring.keyword}</th>
        <th>{burenScoring.reportPurpose}</th>
        <th>{burenScoring?.externalScoringResponse?.data?.detail?.creditSummary?.loanClasses?.total?.normal || 0}</th>
        <th>{burenScoring?.externalScoringResponse?.data?.detail?.creditSummary?.loanClasses?.total?.bad || 0}</th>
        <th>{burenScoring?.restInquiryResponse?.inquiry .lenght|| 0}</th>
        <th>{burenScoring?.externalScoringResponse?.data?.detail?.creditSummary?.loanClasses?.total?.bad || 0}</th>

      </tr>
    );
  }
}

export default Row;
