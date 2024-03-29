import {
  AutoCompletionSelect,
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Spinner,
} from "@erxes/ui/src/components";
import { Title } from "@erxes/ui-settings/src/styles";
import { __ } from "@erxes/ui/src/utils";
import { Wrapper } from "@erxes/ui/src/layout";
import { queries } from "@erxes/ui-products/src/graphql";
import React, { useState, useEffect } from "react";
import { ContentBox } from "../../styles";
import { IConfigsMap, IUom } from "../../types";
import Header from "./Header";
import Sidebar from "./Sidebar";

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  uoms: IUom[];
  loading: boolean;
};

const GeneralSettings: React.FC<Props> = (props) => {
  const [currentMap, setCurrentMap] = useState<IConfigsMap>(
    props.configsMap || {}
  );
  const [is_uom, setIs_uom] = useState(props.configsMap.isRequireUOM || false);
  const [defaultUOM, setDefaultUOM] = useState(
    props.configsMap.defaultUOM ? props.configsMap.defaultUOM : ""
  );

  useEffect(() => {
    setCurrentMap(props.configsMap || {});
    setIs_uom(props.configsMap.isRequireUOM || false);
    setDefaultUOM(props.configsMap.defaultUOM || "");
  }, [props.configsMap]);

  const save = (e) => {
    e.preventDefault();

    props.save(currentMap);
  };

  const onChangeConfig = (code: string, value) => {
    currentMap[code] = value;
    setCurrentMap(currentMap);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeCheckbox = (code: string, e) => {
    const checked = e.target.checked;
    setIs_uom(checked);
    onChangeConfig(code, checked);
  };

  const onChangeUom = ({ selectedOption }) => {
    setDefaultUOM(selectedOption);
    onChangeConfig("defaultUOM", selectedOption);
  };

  const renderCheckbox = (
    key: string,
    title?: string,
    description?: string
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={currentMap[key]}
          onChange={onChangeCheckbox.bind(this, key)}
          componentclass="checkbox"
        />
      </FormGroup>
    );
  };

  const renderCombobox = (
    key: string,
    title?: string,
    description?: string
  ) => {
    const { uoms } = props;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <AutoCompletionSelect
          defaultValue={defaultUOM}
          defaultOptions={(uoms || []).map((e) => e.code)}
          autoCompletionType="uoms"
          placeholder="Enter an uom"
          queryName="uoms"
          query={queries.uoms}
          onChange={onChangeUom}
        />
      </FormGroup>
    );
  };

  const renderContent = () => {
    if (props.loading) {
      return <Spinner objective={true} />;
    }

    return (
      <ContentBox id={"GeneralSettingsMenu"}>
        <CollapseContent
          title="General settings"
          beforeTitle={<Icon icon="settings" />}
          transparent={true}
        >
          {renderCheckbox("isRequireUOM", "is Required UOM", "")}
          {is_uom && renderCombobox("defaultUOM", "default uom")}
        </CollapseContent>
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Products config") },
  ];

  const actionButtons = (
    <Button
      btnStyle="success"
      onClick={save}
      icon="check-circle"
      uppercase={false}
    >
      Save
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Products config")} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Products configs")}</Title>}
          right={actionButtons}
          wideSpacing
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
      transparent={true}
      hasBorder
    />
  );
};

export default GeneralSettings;
