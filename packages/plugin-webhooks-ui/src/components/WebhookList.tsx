import {
  FlexItem,
  FlexRow,
  InputBar,
  Title,
} from "@erxes/ui-settings/src/styles";
import {
  ICommonFormProps,
  ICommonListProps,
} from "@erxes/ui-settings/src/common/types";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AppConsumer } from "@erxes/ui/src";
import { FilterContainer } from "@erxes/ui-settings/src/styles";
import { FormControl } from "@erxes/ui/src";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import List from "@erxes/ui-settings/src/common/components/List";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import Table from "@erxes/ui/src/components/table";
import WebhookForm from "../containers/WebhookForm";
import WebhookRow from "./WebhookRow";
import { __ } from "@erxes/ui/src/utils";
import { router } from "@erxes/ui/src/utils";

type Props = {
  queryParams?: any;
  configsEnvQuery?: any;
  totalCount: number;
  removeWebhook: (id: string) => void;
} & ICommonListProps;

type FinalProps = Props & { currentUser: IUser };

const WebhookList = (props: FinalProps) => {
  const { totalCount, queryParams, configsEnvQuery = {} } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const timerRef = useRef<number | null>(null);

  const [searchValue, setSearchValue] = useState<string>();

  const renderForm = (formProps) => {
    return <WebhookForm {...formProps} queryParams={queryParams} />;
  };

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const renderSearch = () => {
    return (
          <FormControl
            type="text"
            placeholder={__("Type to search")}
            onChange={handleSearch}
            autoFocus={true}
            value={searchValue}
          />
    );
  };

  const handleBrandSelect = (brandIds) => {
    router.setParams(navigate, location, { brandIds });
  };

  const renderBrandChooser = () => {
    const env = configsEnvQuery.configsGetEnv || {};

    if (env.USE_BRAND_RESTRICTIONS !== "true") {
      return null;
    }

    return (
      <InputBar type="active">
        <SelectBrands
          label={__("Filter by brand")}
          onSelect={handleBrandSelect}
          initialValue={queryParams.brandIds}
          name="selectedBrands"
          multi={false}
        />
      </InputBar>
    );
  };

  const renderAttionalButtons = () => {
    return (
      <FilterContainer $marginRight={true}>
        <FlexRow>
          {renderSearch()}
          {renderBrandChooser()}
        </FlexRow>
      </FilterContainer>
    );
  };

  const renderContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__("Enpoint")}</th>
            <th>{__("Status")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <WebhookRow {...props} renderForm={renderForm} />
      </Table>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Webhooks") },
  ];

  const mainHead = (
    <HeaderDescription
      icon="/images/actions/21.svg"
      title={__("Outgoing webhooks")}
      description={__(
        "Webhooks allow you to listen for triggers in your app, which will send relevant data to external URLs in real-time"
      )}
    />
  );

  const title = (
    <Title $capitalize={true}>{`${__("Webhooks")} (${totalCount})`}</Title>
  );

  return (
    <List
      formTitle={__("Add Webhook")}
      size="lg"
      breadcrumb={breadcrumb}
      title={__("Webhooks")}
      leftActionBar={title}
      mainHead={mainHead}
      renderForm={renderForm}
      renderContent={renderContent}
      additionalButton={renderAttionalButtons()}
      hasBorder={true}
      {...props}
    />
  );
};

const WithConsumer = (props: Props & ICommonListProps & ICommonFormProps) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <WebhookList {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
