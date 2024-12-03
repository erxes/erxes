import {
  __,
} from "@erxes/ui/src";
import Box from "@erxes/ui/src/components/Box";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { LinkButton } from "@erxes/ui/src/styles/main";
import React, { useEffect } from "react";
import PullDataDetail from "./PullDataDetail";
import { SidebarList } from "@erxes/ui-settings/src/styles";

type Props = {
  customerId: string;
  configs: any;
  getLoadPullData: () => void;
  loadPullData?: any[];
  loadDataLoading: boolean;
  clickConfigs: any[];
};

export default function PullPolarisCustomer(props: Props) {
  const { loadDataLoading, loadPullData } = props;
  useEffect(() => {
    props.getLoadPullData();
  }, []);

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
