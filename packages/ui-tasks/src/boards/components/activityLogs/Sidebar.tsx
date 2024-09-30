import { FieldStyle, RowFill } from "../../styles/activityLogs";
import React, { useState } from "react";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import FormControl from "@erxes/ui/src/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import { SEARCH_ACTIVITY_CHECKBOX } from "../../constants";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

const { Section } = Wrapper.Sidebar;

type Props = {
  queryParams?: any;
  isChecked?: boolean;
};

const Sidebar = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const clearItem = (key: string) => {
    const onClear = () => {
      router.setParams(navigate, location, { [key]: null });
    };

    if (router.getParam(location, [key])) {
      return (
        <a href="#cancel" tabIndex={0} onClick={onClear}>
          <Icon icon="times-circle" />
        </a>
      );
    }

    return null;
  };

  const onChange = () => {
    const checkboxes: any = document.getElementsByName(
      "activityLogViewGeneral"
    );

    const action: any = [];

    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        action.push(checkbox.value);
      }
    }

    router.setParams(navigate, location, { action: action.toString() });
  };

  const onChangeAll = (e) => {
    router.setParams(navigate, location, {
      action: e.target.checked
        ? SEARCH_ACTIVITY_CHECKBOX.map((a) => a.action).toString()
        : "",
    });
  };

  const { isChecked } = props;
  const activityValues = SEARCH_ACTIVITY_CHECKBOX.map((p) => ({
    label: p,
    title: p,
  }));

  const actionQP: string = (props.queryParams || {}).action || "";

  return (
    <Wrapper.Sidebar>
      <Section.Title>{__("General")}</Section.Title>
      <SidebarList
        id={"checkboxList"}
        style={{
          backgroundColor: "white",
          margin: "0 20px 10px 20px",
          padding: "10px 0",
        }}
      >
        <li key="0">
          <label>
            <RowFill>
              <FormControl
                componentclass="checkbox"
                options={activityValues}
                onChange={onChangeAll}
                checked={actionQP.split(",").length === 5}
              />
              <FieldStyle>All</FieldStyle>
            </RowFill>
          </label>
        </li>
        {SEARCH_ACTIVITY_CHECKBOX.map(({ action, title }, index) => (
          <li key={index}>
            <label>
              <RowFill>
                <FormControl
                  componentclass="checkbox"
                  name="activityLogViewGeneral"
                  options={activityValues}
                  value={action}
                  onChange={onChange}
                  checked={actionQP.includes(action)}
                  defaultChecked={isChecked}
                />
                <FieldStyle>{title}</FieldStyle>
              </RowFill>
            </label>
          </li>
        ))}
      </SidebarList>
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
