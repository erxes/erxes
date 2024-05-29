import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src/layout/styles";
import React, { useEffect, useState } from "react";
import { __, router } from "coreui/utils";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import { CustomPadding } from "@erxes/ui-contacts/src/customers/styles";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { FormControl } from "@erxes/ui/src/components/form";
import { IIntegration } from "@erxes/ui-inbox/src/settings/integrations/types";

interface IProps {
  counts: { [key: string]: number };
  integrations: IIntegration[];
  loading: boolean;
  loadMore: () => void;
  all: number;
}

function Leads({ counts, integrations = [], loading, loadMore, all }: IProps) {
  let timer;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState(
    router.getParam(location, "searchTarget") || ""
  );

  const [disableLoadMoreBtn, setDisableLoadMoreBtn] = useState(false);

  // useEffect(() => {
  //   router.removeParams(navigate, location, 'page');
  // }, [location.search]);

  const onClick = (formId) => {
    router.setParams(navigate, location, { form: formId });
  };

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);
    setDisableLoadMoreBtn(true);

    if (inputValue === "") {
      setDisableLoadMoreBtn(false);
    }
    timer = setTimeout(() => {
      router.setParams(navigate, location, { searchTarget: inputValue });
    }, 1000);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderIntegrations = () => {
    return integrations.map((integration) => {
      const form = integration.form || ({} as any);

      return (
        <li key={integration._id}>
          <a
            href="#filter"
            tabIndex={0}
            className={
              router.getParam(location, "form") === integration.formId
                ? "active"
                : ""
            }
            onClick={onClick.bind(null, integration.formId)}
          >
            <FieldStyle>{integration.name}</FieldStyle>
            <SidebarCounter>{counts[integration.formId]}</SidebarCounter>
          </a>
        </li>
      );
    });
  };

  const data = (
    <SidebarList>
      {renderIntegrations()}

      {all !== integrations.length && !disableLoadMoreBtn ? (
        <Button
          block={true}
          btnStyle="link"
          onClick={loadMore}
          icon="angle-double-down"
        >
          Load more
        </Button>
      ) : null}
    </SidebarList>
  );

  return (
    <Box title={__("Filter by Forms")} name="showFilterByPopUps">
      <CustomPadding>
        <FormControl
          type="text"
          onChange={search}
          placeholder={__("Type to search")}
          value={searchValue}
          onFocus={moveCursorAtTheEnd}
        />
      </CustomPadding>
      <DataWithLoader
        data={data}
        loading={loading}
        count={integrations.length}
        emptyText="Search and filter customers by forms"
        emptyIcon="monitor"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default Leads;
