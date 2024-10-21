import {
  FilterContainer,
  FlexRow,
  Title,
} from "@erxes/ui-settings/src/styles";
import {
  FormControl,
  ModalTrigger,
  Pagination,
} from "@erxes/ui/src/components";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Form from "../containers/Form";
import React from "react";
import Row from "./Row";
import Sidebar from "./Sidebar";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import { router } from "@erxes/ui/src/utils";

type Props = {
  queryParams: any;
  list: any[];
  totalCount: number;
  contentType: string;
  contentTypes: Array<{
    label: string;
    contentType: string;
    subTypes: string[];
  }>;
  remove: (_id: string) => void;
  loading: boolean;
};

function List({
  queryParams,
  contentType,
  contentTypes,
  list,
  totalCount,
  remove,
  loading,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  let timer;

  const typeObject = contentTypes.find(
    (type) => contentType === type.contentType
  );

  const searchHandler = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    timer = setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue: inputValue });
    }, 500);
  };

  const renderSearch = () => {
    return (
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={searchHandler}
        autoFocus={true}
      />
    );
  };

  const modalContent = (modalProps) => {
    const props = {
      ...modalProps,
      contentType,
    };

    return <Form {...props} />;
  };

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      Add Document
    </Button>
  );

  function renderObjects() {
    return list.map((obj) => {
      return <Row key={obj._id} obj={obj} remove={remove} />;
    });
  }

  function renderData() {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__("name")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderObjects()}</tbody>
      </Table>
    );
  }

  function renderContent() {
    return (
      <DataWithLoader
        data={renderData()}
        loading={loading}
        count={list.length}
        emptyText={__("There is no document") + "."}
        emptyImage="/images/actions/8.svg"
      />
    );
  }

  const actionBarRight = () => {
    return (
      <FilterContainer $marginRight={true}>
        <FlexRow>
          {renderSearch()}
          {queryParams.contentType && (
            <ModalTrigger
              content={modalContent}
              size="lg"
              title={__("Add Document")}
              autoOpenKey="showDocumentModal"
              trigger={trigger}
            />
          )}
        </FlexRow>
      </FilterContainer>
    );
  };

  const title = (
    <Title $capitalize={true}>
      {__(` ${typeObject?.label || ""} Documents (${totalCount})`)}
    </Title>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={title}
      right={actionBarRight()}
      wideSpacing={true}
    />
  );

  const sidebar = (
    <Sidebar queryParams={queryParams} contentTypes={contentTypes} />
  );

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Documents"), link: "/settings/documents" },
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Documents`)}
          breadcrumb={breadcrumb}
          queryParams={{ contentType }}
          filterTitle={typeObject?.label || ""}
        />
      }
      actionBar={actionBar}
      content={renderContent()}
      leftSidebar={sidebar}
      footer={<Pagination count={totalCount} />}
      transparent={true}
      hasBorder={true}
    />
  );
}

export default React.memo(List);
