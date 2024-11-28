import moment from 'moment';
import {
  ControlLabel,
  EmptyState,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  Table,
  __,
} from "@erxes/ui/src";
import dayjs from 'dayjs';
import Box from "@erxes/ui/src/components/Box";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { ButtonRelated, LinkButton } from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useEffect, useState } from "react";
import PullDataDetail from "./PullDataDetail";
import PullDataForm from "../containers/PullDataForm";
import { SidebarList } from "@erxes/ui-settings/src/styles";

type Props = {
  customerId: string;
  configs: any;
  getLoadPullData: () => void;
  loadPullData?: any[];
  loadDataLoading: boolean;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
};

export default function PullPolarisCustomer(props: Props) {
  const { loadDataLoading, loadPullData } = props;
  useEffect(() => {
    props.getLoadPullData();
  }, []);

  const trigger = (
    <ButtonRelated>
      <span>{__("Check another scoring...")}</span>
    </ButtonRelated>
  );
  const { customerId } = props;
  const modalContent = (props) => {
    return <PullDataForm {...props} customerId={customerId} pullData={props.loadPullData} />;
  };

  const scoringButton = (
    <ModalTrigger
      size="lg"
      title={__("Customer Scoring")}
      trigger={trigger}
      content={modalContent}
    />
  );

  const renderLoadRow = (loadPullPerData) => {
    const rowTrigger = (<li><LinkButton>{loadPullPerData.title}</LinkButton></li>);

    const rowModalContent = () => {
      return <PullDataDetail pullData={loadPullPerData} />;
    };

    const rowModal = (<ModalTrigger
      size="xl"
      title={__(`lpd.title`)}
      trigger={rowTrigger}
      content={rowModalContent}
    />);


    return rowModal;
  }

  const content = () => {
    if (loadDataLoading) {
      return 'loading...';
    }

    return (
      <>
        <SidebarList className="no-link">
          {
            (loadPullData || []).map(lpd => (
              renderLoadRow(lpd)
            ))
          }
        </SidebarList>
      </>
    )
  }

  return (
    <Box
      title={__(`Pull polaris`)}
      name="showBurenScoring"
      isOpen={true}
    // callback={collapseCallback}
    >
      {content()}
    </Box>
  );
}
