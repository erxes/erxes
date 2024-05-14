import { ChildList, PopoverContent, ToggleIcon } from "./filterableList/styles";
import { FieldStyle, SidebarCounter, SidebarList } from "../layout/styles";
import React, { useState } from "react";
import { getParam, removeParams, setParams } from "../utils/router";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import DataWithLoader from "./DataWithLoader";
import EmptyState from "./EmptyState";
import Filter from "./filterableList/Filter";
import Icon from "./Icon";

interface IProps {
  fields: any[];
  counts: any;
  paramKey: string;
  icon?: string;
  loading: boolean;
  searchable?: boolean;
  update?: () => void;
  multiple?: boolean;
  treeView?: boolean;
}

const FilterByParams: React.FC<IProps> = ({
  fields,
  counts,
  paramKey,
  icon,
  loading,
  searchable,
  update,
  multiple,
  treeView,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [key, setKey] = useState<string>("");
  const [parentFieldIds, setParentFieldIds] = useState<{
    [key: string]: boolean;
  }>({});

  const filterItems = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value);

    if (update) {
      update();
    }
  };

  const onClick = (id: string) => {
    if (!multiple) {
      setParams(navigate, location, { [paramKey]: id });
    } else {
      // multi select
      const value = getParam(location, [paramKey]);
      const params = value ? value.split(",") : [];

      if (params.includes(id)) {
        const index = params.indexOf(id);
        params.splice(index, 1);
      } else {
        params.push(id);
      }

      setParams(navigate, location, { [paramKey]: params.toString() });
    }

    searchParams.delete("page");
  };

  const groupByParent = (array: any[]) => {
    const key = "parentId";
    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  const onToggle = (id: string, isOpen: boolean) => {
    setParentFieldIds({ ...parentFieldIds, [id]: !isOpen });
  };

  const getCount = (field: any, isOpen?: boolean) => {
    let count = counts[field._id];
    if (!treeView || isOpen) {
      return count;
    }

    if (field.relatedIds) {
      const relatedIds = field.relatedIds || [];
      for (const id of relatedIds) {
        count += counts[id];
      }
    }
    return count;
  };

  const renderItems = () => {
    if (fields.length === 0) {
      return <EmptyState icon={icon} text="No templates" size="full" />;
    }

    const renderFieldItem = (field: any, isOpen?: boolean) => {
      if (key && field.name.toLowerCase().indexOf(key) < 0) {
        return false;
      }

      if (!field._id || !field.name) {
        return null;
      }

      let className = "";
      const _id = field._id;
      const value = getParam(location, [paramKey]);

      if (value === _id) {
        className = "active";
      } else if (multiple && value && value.includes(_id)) {
        className = "active";
      }

      return (
        <li key={_id} title={field.name}>
          <a
            href="#param"
            tabIndex={0}
            className={className}
            onClick={() => onClick(_id)}
          >
            {icon ? (
              <Icon icon={icon} style={{ color: field.colorCode }} />
            ) : null}{" "}
            <FieldStyle>{field.name}</FieldStyle>
            <SidebarCounter>{getCount(field, isOpen)}</SidebarCounter>
          </a>
        </li>
      );
    };

    const renderContent = () => {
      if (!treeView) {
        return fields.map((field) => renderFieldItem(field));
      }

      const subFields = fields.filter((f) => f.parentId);
      const parents = fields.filter((f) => !f.parentId);

      const groupByParentObj = groupByParent(subFields);

      const renderTree = (field: any) => {
        const childrens = groupByParentObj[field._id];

        if (childrens) {
          const isOpen = parentFieldIds[field._id];

          return (
            <SidebarList key={`parent-${field._id}`}>
              <ChildList>
                <ToggleIcon
                  onClick={() => onToggle(field._id, isOpen)}
                  type="params"
                >
                  <Icon icon={isOpen ? "angle-down" : "angle-right"} />
                </ToggleIcon>

                {renderFieldItem(field, isOpen)}
                {isOpen &&
                  childrens.map((childField) => renderTree(childField))}
              </ChildList>
            </SidebarList>
          );
        }

        return renderFieldItem(field);
      };

      return parents.map((field) => renderTree(field));
    };

    return (
      <PopoverContent>
        {searchable && <Filter onChange={filterItems} />}

        <SidebarList>{renderContent()}</SidebarList>
      </PopoverContent>
    );
  };

  return (
    <DataWithLoader
      loading={loading}
      count={fields.length}
      data={renderItems()}
      emptyText="Empty"
      emptyIcon="folder-2"
      size="small"
      objective={true}
    />
  );
};

export default FilterByParams;
