import dayjs from "dayjs"
import Box from "@erxes/ui/src/components/Box";
import React from "react";
import { __ } from "@erxes/ui/src";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { ButtonRelated, LinkButton } from "@erxes/ui/src/styles/main";
import ScoringForm from "../../containers/ScoringForm";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { IBurenScoring } from "../../types";
import DetailForm from "../DetailForm";

type Props = {
  collapseCallback?: () => void;
  title?: string;
  mainType?: string;
  id?: string;
  burenCustomerScorings: IBurenScoring[];
  totalCount: number;
};

function Component(props: Props) {
  const trigger = (
    <ButtonRelated>
      <span>{__("Check another scoring...")}</span>
    </ButtonRelated>
  );
  const { id, burenCustomerScorings, totalCount, title, collapseCallback } = props;
  const modalContent = (props) => {
    return <ScoringForm {...props} customerId={id} />;
  };
  const scoringButton = (
    <ModalTrigger
      size="lg"
      title={__("Customer Scoring")}
      trigger={trigger}
      content={modalContent}
    />
  );

  const renderRow = (score) => {
    const rowTrigger = (<li><LinkButton>{dayjs(score.createdAt).format('YYYY-MM-DD')}: ({score.score})</LinkButton></li>);

    const rowModalContent = () => {
      return <DetailForm customerScore={score} />;
    };

    const rowModal = (<ModalTrigger
      size="xl"
      title="Customer Scoring"
      trigger={rowTrigger}
      content={rowModalContent}
    />);


    return rowModal;
  }

  const content = (
    <>
      {
        totalCount && <>
          {burenCustomerScorings.map(s => (
            renderRow(s)
          ))}
        </> ||
        <EmptyState icon="building" text="No scoring" />
      }
      {scoringButton}
    </>
  );

  return (
    <Box
      title={__(`${title || "Loan scoring"}`)}
      name="showBurenScoring"
      isOpen={true}
      callback={collapseCallback}
    >
      {content}
    </Box>
  );
}

export default Component;
