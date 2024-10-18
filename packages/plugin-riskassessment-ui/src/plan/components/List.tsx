import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  Pagination,
  Table,
  Tip,
  Wrapper,
  __,
  router,
} from "@erxes/ui/src";
import { FlexRow, HeaderContent } from "../../styles";

import { Link } from "react-router-dom";
import React, { useState } from "react";
import Row from "./Row";
import { TableHead } from "../../assessments/components/ListHead";
import { headers } from "../common/Headers";
import { setParams } from "@erxes/ui/src/utils/router";
import { subMenu } from "../../common/constants";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  list: any[];
  totalCount: number;
  queryParams: any;
  removePlans: (ids: string[]) => void;
  duplicatePlan: (_id: string) => void;
  changeStatus: (_id: string, status: string) => void;
};

const List = (props: Props) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(
    props.queryParams.searchValue || ""
  );

  const renderContent = () => {
    const { queryParams, list, duplicatePlan, changeStatus } = props;

    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const branchIds = props.list.map((branch) => branch._id);
        return setSelectedItems(branchIds);
      }

      setSelectedItems([]);
    };

    const handleSelect = (id) => {
      if (selectedItems.includes(id)) {
        const removedSelectedItems = selectedItems.filter(
          (selectItem) => selectItem !== id
        );
        return setSelectedItems(removedSelectedItems);
      }
      setSelectedItems([...selectedItems, id]);
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentclass="checkbox"
                onClick={handleSelectAll}
              />
            </th>
            <th>{__("Name")}</th>
            {headers(queryParams).map(({ name, label, sort, filter }) => (
              <TableHead key={name} sort={sort} filter={filter}>
                {label}
              </TableHead>
            ))}
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((plan) => (
            <Row
              plan={plan}
              selectedItems={selectedItems}
              handleSelect={handleSelect}
              queryParams={props.queryParams}
              duplicate={duplicatePlan}
              changeStatus={changeStatus}
            />
          ))}
        </tbody>
      </Table>
    );
  };
  const renderSearchField = () => {
    const search = (e) => {
      if (timer) {
        clearTimeout(timer);
      }

      const searchValue = e.target.value;

      setSearchValue(searchValue);

      timer = setTimeout(() => {
        router.removeParams(navigate, location, "page");
        router.setParams(navigate, location, { searchValue });
      }, 500);
    };
    const moveCursorAtTheEnd = (e) => {
      const tmpValue = e.target.value;

      e.target.value = "";
      e.target.value = tmpValue;
    };
    return (
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        autoFocus={true}
        value={searchValue}
        onFocus={moveCursorAtTheEnd}
      />
    );
  };

  const { totalCount, removePlans, queryParams } = props;

  const onSelectFilter = (name, value) => {
    setParams(navigate, location, { [name]: value });
  };

  const isArchived = queryParams?.isArchived === "true";

  const handleRemove = () => {
    removePlans(selectedItems);
    setSelectedItems([]);
  };

  const leftActionBar = (
    <HeaderDescription
      title={__("Plans")}
      icon="/images/actions/16.svg"
      description=""
      renderExtra={
        <FlexRow>
          <HeaderContent>
            {__(`Total count`)}
            <h4>{totalCount || 0}</h4>
          </HeaderContent>
        </FlexRow>
      }
    />
  );

  const rightActionBar = (
    <BarItems>
      {renderSearchField()}
      {!!selectedItems.length && (
        <Button btnStyle="danger" onClick={handleRemove}>
          {__(`Remove (${selectedItems.length})`)}
        </Button>
      )}
      <Button btnStyle="success">
        <Link to={`/settings/risk-assessment-plans/add`}>{__("Add Plan")}</Link>
      </Button>
      <Tip
        text={`See ${isArchived ? "Active" : "Archived"} Plans`}
        placement="bottom"
      >
        <Button
          btnStyle="link"
          icon={isArchived ? "calendar-alt" : "archive-alt"}
          onClick={() => onSelectFilter("isArchived", !isArchived)}
        />
      </Tip>
    </BarItems>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={"Plans"} submenu={subMenu} />}
      actionBar={
        <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
      }
      content={renderContent()}
      footer={<Pagination count={totalCount} />}
    />
  );
};

export default List;
