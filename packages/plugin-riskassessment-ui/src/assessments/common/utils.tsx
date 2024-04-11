import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Tip,
  __,
  dimensions,
} from "@erxes/ui/src";
import { ClearableBtn, FormContainer } from "../../styles";
import React, { useEffect, useState } from "react";
import { removeParams, setParams } from "@erxes/ui/src/utils/router";
import { useLocation, useNavigate } from "react-router-dom";

import { Attributes } from "@erxes/ui-automations/src//components/forms/actions/styles";
import { CARD_FILTER_ATTRIBUTES } from "./constants";
import Popover from "@erxes/ui/src/components/Popover";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import { generateParamsIds } from "../../common/utils";
import styled from "styled-components";

type Props = {
  title?: string;
  withoutPopoverTitle?: boolean;
  icon?: string;
  iconColor?: string;
  customComponent?: JSX.Element;
  placement?:
    | "auto-start"
    | "auto"
    | "auto-end"
    | "top-start"
    | "top"
    | "top-end"
    | "right-start"
    | "right"
    | "right-end"
    | "bottom-end"
    | "bottom"
    | "bottom-start"
    | "left-end"
    | "left"
    | "left-start";
  rootClose?: boolean;
  children: React.ReactNode;
};

const PopoverContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
  line-height: 24px;

  h5 {
    margin-top: 0;
    line-height: 20px;
  }

  ol {
    padding-left: 20px;
  }
`;

export class DetailPopOver extends React.Component<Props> {
  renderContent() {
    const { customComponent, title, icon, iconColor } = this.props;
    if (customComponent) {
      return customComponent;
    }

    return (
      <>
        {title && (
          <div>
            <ControlLabel>{__(title)}</ControlLabel>
          </div>
        )}
        <div>
          <Button
            style={{ padding: "7px 0" }}
            btnStyle="link"
            iconColor={iconColor}
            icon={icon ? icon : "question-circle"}
          ></Button>
        </div>
      </>
    );
  }

  render() {
    const { rootClose = true, title, withoutPopoverTitle } = this.props;

    return (
      <Popover
        trigger={
          <FormContainer $row $flex $gapBetween={5} align="center">
            {this.renderContent()}
          </FormContainer>
        }
        placement={this.props.placement || "auto"}
        style={{ zIndex: 1050 }}
      >
        <PopoverContent>
          {!withoutPopoverTitle && title && <h5>{title}</h5>}
          {this.props.children}
        </PopoverContent>
      </Popover>
    );
  }
}

type CardFilterTypes = {
  type: string;
  onChange: (value: string, name: string) => void;
  queryParams: any;
};

export const CardFilter = ({
  type,
  queryParams,
  onChange,
}: CardFilterTypes) => {
  const [selectedAttribution, setSelectedAttribution] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      Object.keys(queryParams || {}).find((key) =>
        ["cardBranchIds", "cardDepartmentIds", "cardName"].includes(key)
      )
    ) {
      const selectedAttr = CARD_FILTER_ATTRIBUTES.find((attr) =>
        Object.keys(queryParams || {}).includes(attr.name)
      );
      setSelectedAttribution(selectedAttr);
    }
  }, [queryParams]);

  const renderField = () => {
    const handleChange = (value, name) => {
      onChange(value, name);
    };

    if (selectedAttribution?.name === "cardBranchIds") {
      return (
        <SelectBranches
          label={selectedAttribution.label}
          name={selectedAttribution.name}
          onSelect={handleChange}
          initialValue={queryParams?.cardBranchIds}
        />
      );
    }

    if (selectedAttribution?.name === "cardDepartmentIds") {
      return (
        <SelectDepartments
          label={selectedAttribution.label}
          name={selectedAttribution.name}
          onSelect={handleChange}
          initialValue={queryParams?.cardDepartmentIds}
        />
      );
    }

    return (
      <FormControl
        placeholder={`Choose ${selectedAttribution.label}`}
        name={selectedAttribution.name}
        defaultValue={queryParams?.cardName || ""}
        onChange={(event) => {
          const { value } = event.target as HTMLInputElement;
          setTimeout(() => {
            removeParams(navigate, location, "page");
            setParams(navigate, location, { cardName: value });
          }, 500);
        }}
      />
    );
  };

  const handleSelectAttribution = (item) => {
    setSelectedAttribution(item);
    selectedAttribution && onChange("", selectedAttribution.name);
  };

  const handleClear = () => {
    setSelectedAttribution(null);
    removeParams(
      navigate,
      location,
      "cardBranchIds",
      "cardDepartmentIds",
      "cardName"
    );
  };

  if (!type) {
    return null;
  }

  return (
    <FormGroup>
      <FormContainer $row $spaceBetween>
        <DetailPopOver
          title="Attribution"
          withoutPopoverTitle
          icon="downarrow-2"
          placement="top"
        >
          <Attributes>
            {CARD_FILTER_ATTRIBUTES.map((item) => (
              <li key={item.name} onClick={() => handleSelectAttribution(item)}>
                {item.label}
                {selectedAttribution?.name === item.name && (
                  <Icon icon="check" style={{ paddingLeft: 5 }} />
                )}
              </li>
            ))}
          </Attributes>
        </DetailPopOver>
        {selectedAttribution &&
          Object.keys(queryParams || {}).find((key) =>
            ["cardBranchIds", "cardDepartmentIds", "cardName"].includes(key)
          ) && (
            <ClearableBtn onClick={handleClear}>
              <Tip text="Clear" placement="top">
                <Icon icon="cancel-1" />
              </Tip>
            </ClearableBtn>
          )}
      </FormContainer>
      {selectedAttribution && (
        <FormGroup>
          <ControlLabel>{selectedAttribution?.label}</ControlLabel>
          {renderField()}
        </FormGroup>
      )}
    </FormGroup>
  );
};

export const generateCardFiltersQueryParams = (queryParams) => {
  const params: any = {};

  if (queryParams?.cardBranchIds) {
    params.name = "branchIds";
    params.values = generateParamsIds(queryParams.cardBranchIds);
  }

  if (queryParams?.cardDepartmentIds) {
    params.name = "departmentIds";
    params.values = generateParamsIds(queryParams.cardDepartmentIds);
  }
  if (queryParams?.cardName) {
    params.name = "name";
    params.value = queryParams.cardName;
    params.regex = true;
  }

  return params;
};
