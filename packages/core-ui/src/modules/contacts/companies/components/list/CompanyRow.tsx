import { ClickableRow } from "@erxes/ui-contacts/src/customers/styles";
import { FlexContent } from "@erxes/ui-log/src/activityLogs/styles";
import FormControl from "@erxes/ui/src/components/form/Control";
import { ICompany } from "../../types";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import React from "react";
import Tags from "@erxes/ui/src/components/Tags";
import TextInfo from "@erxes/ui/src/components/TextInfo";
import _ from "lodash";
import { displayObjectListItem } from "../../../customers/utils";
import { formatValue } from "@erxes/ui/src/utils";

type Props = {
  index: number;
  company: ICompany;
  columnsConfig: any[];
  navigate: any;
  isChecked: boolean;
  toggleBulk: (company: ICompany, isChecked?: boolean) => void;
};

function displayValue(company, name, group, index) {
  const value = _.get(company, name);

  if (name === "primaryName") {
    return (
      <FlexContent>
        <NameCard.Avatar company={company} size={30} /> &emsp;
        {formatValue(company.primaryName)}
      </FlexContent>
    );
  }

  if (name === "code") {
    return <TextInfo>{value}</TextInfo>;
  }

  if (name === "#") {
    return <TextInfo>{index.toString()}</TextInfo>;
  }

  if (name.includes("customFieldsData")) {
    return displayObjectListItem(company, "customFieldsData", name, group);
  }

  return formatValue(value);
}

function CompanyRow({
  company,
  columnsConfig,
  navigate,
  isChecked,
  toggleBulk,
  index,
}: Props) {
  const tags = company.getTags || [];

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(company, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    navigate(`/companies/details/${company._id}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td id="companiesCheckBox" onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      {columnsConfig.map(({ name, group }) => (
        <td key={name}>
          <ClickableRow>
            {displayValue(company, name, group, index)}
          </ClickableRow>
        </td>
      ))}
      <td>
        <Tags tags={tags} limit={2} />
      </td>
    </tr>
  );
}

export default CompanyRow;
