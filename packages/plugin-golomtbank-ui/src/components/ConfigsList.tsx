import * as routerUtils from "@erxes/ui/src/utils/router";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@erxes/ui/src/components/Button";
import { ConfigList } from "../styles";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Form from "../configs/containers/Form";
import { IGolomtBankConfigsItem } from "../types/IConfigs";
import LeftSidebar from "@erxes/ui/src/layout/components/Sidebar";
import LoadMore from "@erxes/ui/src/components/LoadMore";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import { TopHeader } from "@erxes/ui/src/styles/main";
import AccountRow from "../corporateGateway/accounts/components/Row";

type Props = {
  configs: IGolomtBankConfigsItem[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  refetch?: () => void;
};

const ConfigsList = (props: Props) => {
  const { configs, totalCount, queryParams, loading } = props;
  const location = useLocation();
  const navigate = useNavigate();

 
  React.useEffect(() => {
    const defaultAccount = JSON.parse(
      localStorage.getItem("golomtBankDefaultAccount") || "{}"
    );

    if (defaultAccount.configId && defaultAccount.accountNumber) {
      routerUtils.setParams(navigate, location, {
        _id: defaultAccount.configId,
        account: defaultAccount.accountNumber,
      });
    }
  }, []);
  const renderRow = () => {
    return configs.map((config) => {
      return (
        <AccountRow
          {...config}
          queryParams={queryParams}
          account={config}
          configId={config._id}
        />
      );
    });
  };

  const renderSidebarHeader = () => {
    const addConfig = (
      <Button
        btnStyle="success"
        block={true}
        uppercase={false}
        icon="plus-circle"
      >
        Add New Config
      </Button>
    );

    const formContent = (formProps) => <Form {...formProps} />;

    return (
      <TopHeader>
        <ModalTrigger
          size="sm"
          title="Corporate Gateway"
          trigger={addConfig}
          enforceFocus={false}
          content={formContent}
        />
      </TopHeader>
    );
  };

  return (
    <ConfigList>
      <LeftSidebar wide={true} header={renderSidebarHeader()} hasBorder={true}>
        <SidebarList
          $noTextColor={true}
          $noBackground={true}
          id={"golomtBankSidebar"}
        >
          {renderRow()}
          <LoadMore all={totalCount} loading={loading} />
        </SidebarList>
        {!loading && totalCount === 0 && (
          <EmptyState
            image="/images/actions/18.svg"
            text="There is no config yet. Start by adding one."
          />
        )}
      </LeftSidebar>
    </ConfigList>
  );
};

export default ConfigsList;
