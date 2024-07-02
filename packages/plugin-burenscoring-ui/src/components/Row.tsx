import { Button, ModalTrigger } from "@erxes/ui/src";
import React from "react";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import DetailForm from "./DetailForm";
import dayjs from "dayjs"
export const BurenscoringWrapper = styledTS<{ space: number }>(
  styled.div
)`padding-left: ${(props) => props.space * 20}px;
  display:inline-flex;
  justify-content:flex-start;
  align-items: center;
`;

type Props = {
  burenScoring: any;
};

export default function Row(props: Props) {
  const { burenScoring } = props;
  const trigger = (
    <Button
      btnStyle="primary"
      block={true}
      size="small"
      uppercase={false}
      icon="eye"
    >
      detail
    </Button>
  );
  const modalContent = () => {
    return <DetailForm customerScore={burenScoring} />;
  };
  const scoringButton = (
    <ModalTrigger
      size="xl"
      title="Scoring detail"
      trigger={trigger}
      content={modalContent}
    />
  );
  return (
    <tr>
      <th>{burenScoring.keyword}</th>
      <th>{burenScoring?.score}</th>
      <th>{burenScoring.reportPurpose}</th>
      <th>{dayjs(burenScoring?.createdAt).format('YYYY-MM-DD')}</th>
      <th> {scoringButton}</th>
    </tr>
  );
}
