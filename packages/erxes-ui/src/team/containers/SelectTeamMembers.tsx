import React, { FC, useCallback } from "react";
import { IUser, IUserDetails } from "../../auth/types";
import SelectWithSearch from "../../components/SelectWithSearch";
import { IOption, IQueryParams } from "../../types";
import { queries } from "../graphql";

interface Props {
  queryParams?: IQueryParams;
  filterParams?: {
    ids?: string[];
    status?: string;
    excludeIds?: boolean;
    isAssignee?: boolean;
    branchIds?: string[];
    departmentIds?: string[];
  };
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  withCustomStyle?: boolean;
  customOption?: IOption;
  customField?: string;
  initialValue?: string | string[];
  name: string;
}

const UserSelect: FC<Props> = ({
  queryParams,
  onSelect,
  customOption,
  customField,
  initialValue,
  multi = true,
  label,
  filterParams,
  name,
  withCustomStyle,
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateUserOptions = useCallback(
    (array: IUser[] = []): IOption[] =>
      array.map((user) => {
        const details: IUserDetails = user.details || ({} as IUserDetails);

        const customFieldValue =
          customField && user[customField] ? String(user[customField]) : "";

        const includeCustomFieldOnSelectLabel =
          customField && user[customField] ? user[customField] : "";

        const fullName =
          (details.fullName || user.email) +
          "\t" +
          includeCustomFieldOnSelectLabel;

        const positionTitles =
          user.positions?.map((pos) => pos.title).join(", ") || "";

        const branchTitles = user.branches
          ? user.branches
              .slice(0, 2)
              .map((branch) => branch.title)
              .join(", ") +
            (user.branches.length > 2 ? ` +${user.branches.length - 2}` : "")
          : "";

        const labelParts = [
          fullName,
          positionTitles,
          branchTitles,
          customFieldValue,
        ].filter(Boolean);

        const generateLabel = labelParts.join(" • ");

        const fullLabelParts = [
          fullName,
          positionTitles,
          user.branches?.map((b) => b.title).join(", "),
          customFieldValue,
        ].filter(Boolean);

        const fullLabel = fullLabelParts.join(" • ");

        return {
          value: user._id,
          label: generateLabel,
          avatar: details.avatar,
          fullLabel,
          selectedLabel: fullName,
        };
      }),
    [customField]
  );

  const customStyles = withCustomStyle
    ? {
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
          maxWidth: "400px",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "3px",
            "&:hover": {
              background: "#a8a8a8",
            },
          },
        }),
        menuList: (base) => ({
          ...base,
          minWidth: "400px",
        }),
      }
    : undefined;

  return (
    <SelectWithSearch
      label={label}
      queryName="users"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateUserOptions}
      onSelect={onSelect}
      customQuery={queries.users}
      customOption={customOption}
      multi={multi}
      customStyles={customStyles}
      menuPortalTarget={withCustomStyle ? document.body : undefined}
    />
  );
};

export default UserSelect;
