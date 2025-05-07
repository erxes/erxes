import {
  ButtonRelated,
  DynamicComponentList,
  DynamicTableWrapper,
  ModalFooter,
  XypTitle,
} from "@erxes/ui/src/styles/main";
import React, { useState } from "react";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";

import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import CollapseContent from "@erxes/ui/src/components/CollapseContent";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DynamicComponentContent from "@erxes/ui/src/components/dynamicComponent/Content";
import ErrorMsg from "@erxes/ui/src/components/ErrorMsg";
import { Footer } from "@erxes/ui/src/styles/chooser";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IOperation } from "../types";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Select from "react-select";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import Spinner from "@erxes/ui/src/components/Spinner";
import Table from "@erxes/ui/src/components/table";
import { XYP_TITLES } from "../constants";
import { __ } from "@erxes/ui/src/utils/core";
import moment from "moment";

type Props = {
  xypDatas: any[];
  list: any;
  fetchData: any;
  xypServiceList: any;
  loading: any;
  error: string;
  showType?: string;
};

function Sidebar({
  xypDatas,
  list,
  fetchData,
  xypServiceList,
  error,
  loading,
  showType,
}: Props) {
  const [params, setParams] = useState({});
  const [currentTab, setCurrentTab] = useState("WS100101_getCitizenIDCardInfo");
  const [operation, setOperation] = useState<IOperation>({
    orgName: "",
    wsOperationDetail: "",
    wsOperationName: "",
    wsVersion: "",
    wsWsdlEndpoint: "",
    input: [],
    output: [],
  });

  const onChangeTag = (value: any) => {
    const operation = xypServiceList?.find(
      (x) => x.wsOperationName === value.value
    );
    setOperation(operation);
  };

  const renderServiceChooser = (props) => {
    if (loading) return <Spinner size={40} objective />;

    if (error) {
      return <ErrorMsg>Хур дамжин сервер</ErrorMsg>;
    }

    const operationList = list?.value?.servicelist.map((d) => ({
      value: d,
      label: xypServiceList?.find((x) => x.wsOperationName === d)
        ?.wsOperationDetail,
    }));

    const onChange = (e: any) => {
      e.persist();
      setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
      <>
        <Select
          placeholder={__("Type to search...")}
          value={operationList?.find(
            (o) => o.value === operation.wsOperationName
          )}
          onChange={onChangeTag}
          isLoading={props.loading}
          options={operationList}
          isClearable={true}
          isMulti={false}
        />
        <div style={{ marginTop: 10 }} />
        <Box title="inputs">
          {operation.input.map((d: any) => (
            <div style={{ padding: 10 }} key={d?.wsInputDetail}>
              <FormGroup>
                <ControlLabel required={false}>{d?.wsInputDetail}</ControlLabel>

                <FormControl
                  name={d.wsInputName}
                  required={false}
                  autoFocus={false}
                  onChange={onChange}
                />
              </FormGroup>
            </div>
          ))}
        </Box>

        <ModalFooter>
          <Footer>
            <div>
              <Button
                btnStyle="simple"
                uppercase={false}
                onClick={() => { }}
                icon="times-circle"
              >
                Cancel
              </Button>
              <Button
                btnStyle="success"
                onClick={() => {
                  fetchData(operation, params, {}, () => { });
                }}
                icon="check-circle"
                uppercase={false}
              >
                Select
              </Button>
            </div>
          </Footer>
        </ModalFooter>
      </>
    );
  };

  const relServiceTrigger = (
    <ButtonRelated>
      <span>{__("Fetch data...")}</span>
    </ButtonRelated>
  );

  const relQuickButtons = (
    <ModalTrigger
      title="Xyp системээс мэдээлэл татах"
      trigger={relServiceTrigger}
      size="lg"
      content={renderServiceChooser}
    />
  );

  const renderServiceItem = (i, output) => {
    const items = Object.keys(i).filter((key) => typeof i[key] !== "object");

    const renderOutput = (value: any) => {
      return (
        output?.find((x) => x.wsResponseName === value) || {
          wsResponseDetail: value,
        }
      );
    };

    const renderData = (type: string, key: string) => {
      if (type?.toLowerCase()?.includes("byte") || key.includes("image")) {
        return <img height={80} src={`data:image/png;base64,${i[key]}`} />;
      }
      if (type?.toLowerCase()?.includes("date") || key.includes("date")) {
        return moment(i[key]).format("YYYY-MM-DD");
      }

      return i[key];
    };

    const renderRows = () => {
      const rows = [] as any;
      for (let i = 0; i < items.length; i += 4) {
        const rowItems = items.slice(i, i + 4);
        const row = (
          <tr key={i}>
            {rowItems.map((key, j) => (
              <td key={j}>
                <ControlLabel>
                  {renderOutput(key)?.wsResponseDetail}
                </ControlLabel>
                <div>
                  {renderData(renderOutput(key)?.wsResponseDatatype, key)}
                </div>
              </td>
            ))}
          </tr>
        );

        rows.push(row);
      }

      return rows;
    };

    return (
      <Table $striped $bordered $responsive>
        <tbody id="hurData"> {renderRows()}</tbody>
      </Table>
    );
  };

  const modalContent = (props, xd, d: any) => {
    if (!d.data) return <div className="empty">мэдээлэл байхгүй</div>;

    const output =
      (xypServiceList.find((x) => x.wsOperationName === d?.serviceName)
        ?.output as any) || [];

    if (d.data?.list?.length || d.data?.listData?.length) {
      return (
        <div id="hurData" key={d?.serviceDescription}>
          {(d.data.list || d.data.listData || []).map(
            (listItem, index: number) => (
              <React.Fragment key={index}>
                <h4>
                  #{index + 1} {XYP_TITLES[d?.serviceName]}
                </h4>
                {renderServiceItem(listItem, output)}
              </React.Fragment>
            )
          )}
        </div>
      );
    }

    return renderServiceItem(d.data, output);
  };

  const renderSalaryRows = (item) => {
    return (
      <tr>
        <td>{item.year}</td>
        <td>{item.month}</td>
        <td>{item.orgName}</td>
        <td>{item.salaryAmount.toLocaleString("en-US")}</td>
        <td>{item.salaryFee.toLocaleString("en-US")}</td>
        <td>{item.domName}</td>
        <td className={`salary ${item.paid ? "paid" : ""}`}>
          <b>{item.paid ? "Төлсөн" : "Төлөөгүй"}</b>
        </td>
      </tr>
    );
  };

  const renderSalaryTable = (xypData) => {
    if (!xypData.data || !xypData.data.list || xypData.data.list.length === 0)
      return <div className="empty">Одоогоор мэдээлэл байхгүй байна!</div>;

    return (
      <Table $striped $bordered $responsive>
        <thead className="salary-center">
          <tr>
            <th>НДШ төлсөн он</th>
            <th>НДШ төлсөн сар</th>
            <th>Ажил олгогч</th>
            <th>Цалин</th>
            <th>НДШ-ийн дүн</th>
            <th>Ажил олгогчийн дүүрэг</th>
            <th>НДШ төлөгдсөн эсэх</th>
          </tr>
        </thead>
        <tbody id="hurData">
          {(xypData.data.list || xypData.data.listData || []).map(
            (listItem, index: number) => (
              <React.Fragment key={index}>
                {renderSalaryRows(listItem)}
              </React.Fragment>
            )
          )}
        </tbody>
      </Table>
    );
  };

  const renderContent = (xypContent, xypData) => {
    if (showType && showType === "list") {
      if (xypData.serviceName !== currentTab) {
        return null;
      }

      return (
        <DynamicComponentList $hasMargin={true}>
          <h4>
            {moment(xypContent.createdAt).format("YYYY-MM-DD")}{" "}
            {xypData && xypData.length}
          </h4>
          <DynamicTableWrapper>
            {xypData.serviceName === "WS100501_getCitizenSalaryInfo"
              ? renderSalaryTable(xypData)
              : modalContent("", xypContent, xypData)}
          </DynamicTableWrapper>
        </DynamicComponentList>
      );
    }

    return (
      <ModalTrigger
        title={`${moment(xypContent.createdAt).format("YYYY-MM-DD")} - ${XYP_TITLES[xypData.serviceName]}`}
        trigger={
          <XypTitle
            key={`${xypContent._id} ${XYP_TITLES[xypData.serviceName]}`}
          >
            {moment(xypContent.createdAt).format("YYYY-MM-DD")}:{" "}
            {XYP_TITLES[xypData.serviceName]}
          </XypTitle>
        }
        size="xl"
        content={(props) =>
          xypData.serviceName === "WS100501_getCitizenSalaryInfo"
            ? renderSalaryTable(xypData)
            : modalContent(props, xypContent, xypData)
        }
        key={xypData.serviceName}
      />
    );
  };

  const renderXypContent = () => {
    return (xypDatas || []).map((xd) =>
      (xd.data || []).map((d) => renderContent(xd, d))
    );
  };

  const content = () => {
    if (showType && showType === "list") {
      return (
        <SidebarList className="no-link">
          <Tabs full>
            <TabTitle
              className={
                currentTab === "WS100101_getCitizenIDCardInfo" ? "active" : ""
              }
              onClick={() => setCurrentTab("WS100101_getCitizenIDCardInfo")}
            >
              {__("Иргэний үнэмлэхний мэдээлэл")}
            </TabTitle>
            <TabTitle
              className={
                currentTab === "WS100501_getCitizenSalaryInfo" ? "active" : ""
              }
              onClick={() => setCurrentTab("WS100501_getCitizenSalaryInfo")}
            >
              {__("Цалингийн мэдээлэл")}
            </TabTitle>
            <TabTitle
              className={
                currentTab === "WS100202_getPropertyList" ? "active" : ""
              }
              onClick={() => setCurrentTab("WS100202_getPropertyList")}
            >
              {__("Хөрөнгийн мэдээлэл")}
            </TabTitle>
            <TabTitle
              className={
                currentTab === "WS100406_getCitizenVehicleList" ? "active" : ""
              }
              onClick={() => setCurrentTab("WS100406_getCitizenVehicleList")}
            >
              {__("Тээврийн хэрэгслийн мэдээлэл")}
            </TabTitle>
          </Tabs>
          {renderXypContent()}
          {relQuickButtons}
        </SidebarList>
      );
    }

    return (
      <>
        <SidebarList className="no-link">{renderXypContent()}</SidebarList>
        {relQuickButtons}
      </>
    );
  };

  if (showType && showType === "list") {
    return <DynamicComponentContent>{content()}</DynamicComponentContent>;
  }

  return (
    <Box title="Xyp" name="xyp" isOpen={true}>
      {content()}
    </Box>
  );
}

export default Sidebar;
