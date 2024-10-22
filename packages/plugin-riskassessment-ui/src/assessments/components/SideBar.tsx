import {
  Box,
  ControlLabel,
  FormGroup,
  Icon,
  Sidebar,
  Tip,
  __,
} from "@erxes/ui/src";
import { removeParams, setParams } from "@erxes/ui/src/utils/router";
import React from "react";
import Select from "react-select";
import { cardTypes } from "../../common/constants";
import { FilterByTags } from "../../common/utils";
import { ClearableBtn, Padding, SidebarHeader } from "../../styles";
import { CardFilter } from "../common/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  label: string;
  field: any;
  clearable?: boolean;
  type?: string;
}

export function SideBar({ queryParams }) {
  const location = useLocation();
  const navigate = useNavigate();

  const onChangeCardType = (e) => {
    removeParams(navigate, location, "page");
    setParams(navigate, location, { cardType: e.value });
  };
  const handleSelectStructure = (values, name) => {
    removeParams(navigate, location, "page");
    setParams(navigate, location, { [name]: [...values] });
  };
  const CustomForm = ({ children, label, field, clearable }: LayoutProps) => {
    const handleClearable = () => {
      if (Array.isArray(field)) {
        field.forEach((name) => {
          return removeParams(navigate, location, name);
        });
      }
      removeParams(navigate, location, field);
    };

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        {clearable && (
          <ClearableBtn onClick={handleClearable}>
            <Tip text="Clear">
              <Icon icon="cancel-1" />
            </Tip>
          </ClearableBtn>
        )}
        {children}
      </FormGroup>
    );
  };

  return (
    <Sidebar
      full
      header={<SidebarHeader>{__("Additional Filter")}</SidebarHeader>}
    >
      <Padding>
        <FilterByTags queryParams={queryParams} />
        <Box title={__("Card Filters")} name="cardFilters" isOpen>
          <Padding>
            <CustomForm
              label="Card type"
              field={"cardType"}
              clearable={!!queryParams?.cardType}
            >
              <Select
                placeholder={__("Select Type")}
                value={cardTypes.find((o) => o.value === queryParams?.cardType)}
                options={cardTypes}
                isMulti={false}
                isClearable={true}
                onChange={onChangeCardType}
              />
            </CustomForm>
            <CardFilter
              type={queryParams.cardType}
              onChange={handleSelectStructure}
              queryParams={queryParams}
              history={navigate}
            />
          </Padding>
        </Box>
      </Padding>
    </Sidebar>
  );
}
