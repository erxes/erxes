import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import React, { useRef } from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { __, router } from "@erxes/ui/src/utils";
import { Link } from "react-router-dom";
import { SidebarFilters } from "../../../styles";
import { SidebarList as List } from "@erxes/ui/src/layout";
import { Wrapper } from "@erxes/ui/src/layout";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

const Sidebar = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { queryParams } = props;

  const timerRef = useRef<number | null>(null);

  const clearCategoryFilter = () => {
    router.removeParams(
      navigate,
      location,
      "filterStatus",
      "minMulitiplier",
      "maxMulitiplier"
    );
  };

  const setFilter = (name, value) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { [name]: value });
  };

  const handleStatusSelect = (name, selectedOption) => {
    setFilter(name, selectedOption.value);
  };

  const searchMultiplier = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const name = e.target.name;
    const value = e.target.value;

    timerRef.current = window.setTimeout(() => {
      setFilter(name, value);
    }, 500);
  };

  const renderListItem = (url: string, text: string) => {
    return (
      <li>
        <Link
          to={url}
          className={window.location.href.includes(url) ? "active" : ""}
        >
          {__(text)}
        </Link>
      </li>
    );
  };

  const statusOptions = [
    {
      label: "All status",
      value: "",
    },
    {
      label: "Active",
      value: "active",
    },
    {
      label: "Archived",
      value: "archived",
    },
  ];

  return (
    <>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {(router.getParam(location, "filterStatus") ||
            router.getParam(location, "minMulitiplier") ||
            router.getParam(location, "maxMulitiplier")) && (
            <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
              <Tip text={__("Clear filter")} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
      <SidebarFilters>
        <List id="SettingsSidebar">
          <FormGroup>
            <ControlLabel>{__(`Min variable`)}</ControlLabel>
            <FormControl
              name="minMulitiplier"
              type="number"
              min={0}
              required={false}
              defaultValue={queryParams.minMulitiplier || ""}
              onChange={searchMultiplier}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__(`Max variable`)}</ControlLabel>
            <FormControl
              name="maxMulitiplier"
              type="number"
              min={0}
              required={false}
              defaultValue={queryParams.maxMulitiplier || ""}
              onChange={searchMultiplier}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Status</ControlLabel>
            <Select
              name="filterStatus"
              value={statusOptions.find(
                (o) => o.value === (queryParams.filterStatus || "")
              )}
              onChange={(option) => handleStatusSelect("filterStatus", option)}
              options={statusOptions}
              isClearable={false}
            />
          </FormGroup>
        </List>
      </SidebarFilters>
    </>
  );
};

export default Sidebar;
