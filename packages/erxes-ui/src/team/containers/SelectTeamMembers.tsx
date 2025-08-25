import { IUser, IUserDetails } from "../../auth/types";
import SelectWithSearch from "../../components/SelectWithSearch";
import { IOption, IQueryParams } from "../../types";
import React from "react";
import { queries } from "../graphql";

export default (props: {
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
}) => {
  const {
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
  } = props;
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  // get user options for react-select
  function generateUserOptions(array: IUser[] = []): IOption[] {
    return array.map((item) => {
      const user = item || ({} as IUser);
      const details = item.details || ({} as IUserDetails);
      const includeCustomFieldOnSelectLabel =
        customField && user[customField] ? user[customField] : "";

      // Extract position titles
      const positionTitles = user.positions
        ? user.positions.map((pos) => pos.title).join(", ")
        : "";

      const branchTitles = user.branches
        ? user.branches
            .slice(0, 2)
            .map((branch) => branch.title)
            .join(", ") +
          (user.branches.length > 2 ? ` +${user.branches.length - 2}` : "") // Нэмэлт салбаруудын тоо
        : "";

      const displayName =
        details.shortName || details.fullName?.split(" ")[0] || user.email;

      const generateLabel =
        displayName +
        (positionTitles ? ` • ${positionTitles}` : "") +
        (branchTitles ? ` • ${branchTitles}` : "") +
        (includeCustomFieldOnSelectLabel
          ? ` • ${includeCustomFieldOnSelectLabel}`
          : "");

      const fullLabel =
        (details.fullName || user.email) +
        (positionTitles ? ` • ${positionTitles}` : "") +
        (user.branches
          ? ` • ${user.branches.map((b) => b.title).join(", ")}`
          : "") +
        (includeCustomFieldOnSelectLabel
          ? ` • ${includeCustomFieldOnSelectLabel}`
          : "");

      return {
        value: user._id,
        label: generateLabel,
        avatar: details.avatar,
        fullLabel: fullLabel,
      };
    });
  }

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

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
      customStyles={withCustomStyle && customStyles}
      menuPortalTarget={withCustomStyle && document.body}
    />
  );
};
