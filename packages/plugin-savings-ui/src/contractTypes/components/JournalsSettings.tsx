import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleTitle as Title,
  Wrapper,
} from "@erxes/ui/src";
import { dimensions } from "@erxes/ui/src";
import styled from "styled-components";

import React, { useState } from "react";
import { JOURNALS_KEY_LABELS } from "../constants";
import { IContractConfig, IContractTypeDetail } from "../types";
import { __ } from "coreui/utils";
import { ScrollWrapper } from "@erxes/ui/src/styles/main";

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

const ContentWrapper = styled.div`
  background: white;
`;

type Props = {
  contractType: IContractTypeDetail;
  saveItem: (doc: IContractTypeDetail, callback?: (item) => void) => void;
};

const GeneralSettings = (props: Props) => {
  const [currentMap, setCurrentMap] = useState(props.contractType.config || {} as IContractConfig);
  const [state, setState] = useState(props.contractType);
  const { contractType } = props;

  const save = (e) => {
    e.preventDefault();

    props.saveItem({ ...contractType, ...state, config: currentMap });
  };

  const onChangeConfig = (code: string, value) => {
    setCurrentMap({ ...currentMap, [code]: value });
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const renderItem = (
    key: string,
    description?: string,
    controlProps?: any
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{__(JOURNALS_KEY_LABELS[key])}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          {...controlProps}
          value={currentMap[key]}
          onChange={onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  const actionButtons = (
    <Button
      btnStyle="primary"
      onClick={save}
      icon="check-circle"
      uppercase={false}
    >
      {__("Save")}
    </Button>
  );

  const content = (
    <ScrollWrapper>
      <ContentBox>
        <CollapseContent title={__("Данс")}>
          {renderItem("transAccount")}
          {renderItem("savingAccount")}
          {renderItem("interestAccount")}
          {renderItem("storedInterestAccount")}
        </CollapseContent>
        <CollapseContent title={__("Range config")}>
          {renderItem("minInterest", "Min interest /Month/", {
            type: "number",
          })}
          {renderItem("maxInterest", "Max interest /Month/", {
            type: "number",
          })}
          {renderItem("defaultInterest", "Default interest /Month/", {
            type: "number",
          })}
          {renderItem("minDuration", "Min duration /Month/", {
            type: "number",
          })}
          {renderItem("maxDuration", "Max duration /Month/", {
            type: "number",
          })}
          {renderItem("minAmount", "Min amount /Month/", {
            type: "number",
            useNumberFormat: true,
          })}
          {renderItem("maxAmount", "Max amount /Month/", {
            type: "number",
            useNumberFormat: true,
          })}
        </CollapseContent>
        <CollapseContent title={__("Store interest config")}>
          {renderItem("storeInterestTime", "Store interest time", {
            type: "time",
          })}
        </CollapseContent>
        <CollapseContent title={__("Internet bank")}>
          <FormGroup>
            <ControlLabel required={true}>
              {__("Product Type")}
            </ControlLabel>
            <FormControl
              name="productType"
              componentclass="select"
              value={state.productType}
              onChange={e => setState({ ...state, productType: (e.target as any).value })}
            >
              {["private", "public"].map((typeName) => (
                <option key={typeName} value={typeName}>
                  {typeName}
                </option>
              ))}
            </FormControl>
          </FormGroup>
        </CollapseContent>
      </ContentBox>
    </ScrollWrapper>
  );

  return (
    <ContentWrapper>
      <Wrapper.ActionBar
        left={<Title>{__("Journals configs")}</Title>}
        right={actionButtons}
      />
      {content}
    </ContentWrapper>
  );
};

export default GeneralSettings;
