import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  ModalTrigger,
  Table,
  __,
  router,
} from "@erxes/ui/src";
import { FlexRow, HeaderContent } from "../../../styles";

import { DefaultWrapper } from "../../../common/utils";
import Form from "../containers/Form";
import { IIndicatorsGroups } from "../common/types";
import React, { useState } from "react";
import Row from "./Row";
import Sidebar from "../../components/SideBar";
import { subMenu } from "../../../common/constants";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  list: IIndicatorsGroups[];
  totalCount: number;
  remove: (ids: string[]) => void;
};

const List = (props: Props) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(
    props.queryParams.searchValue || ""
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const addIndicatorGroups = () => {
    const trigger = (
      <Button btnStyle="success">{__("Add Grouping Indicators")}</Button>
    );

    const content = (props) => (
      <Form queryParams={props.queryParams} {...props} />
    );

    return (
      <ModalTrigger
        trigger={trigger}
        content={content}
        enforceFocus={false}
        title="Add Grouping Indicators"
        size="xl"
      />
    );
  };

  const renderSearchField = () => {
    const handleSearch = (e) => {
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

    return (
      <FormControl
        type="text"
        placeholder="type a search"
        onChange={handleSearch}
        value={searchValue}
      />
    );
  };

  const renderRemove = () => {
    const handleRemove = () => {
      props.remove(selectedItems);
      setSearchValue([]);
    };

    return (
      <Button btnStyle="danger" onClick={handleRemove}>
        {__("Remove")}
      </Button>
    );
  };

  const renderContent = () => {
    const { list, queryParams } = props;

    const selectAll = () => {
      if (!selectedItems.length) {
        const ids = list.map((item) => item._id);
        return setSelectedItems(ids);
      }

      setSelectedItems([]);
    };

    const selectItem = (id) => {
      if (selectedItems.includes(id)) {
        const newselectedItems = selectedItems.filter((p) => p !== id);
        return setSelectedItems(newselectedItems);
      }
      setSelectedItems([...selectedItems, id]);
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl componentclass="checkbox" onClick={selectAll} />
            </th>
            <th>{__("Name")}</th>
            <th>{__("Tags")}</th>
            <th>{__("Created At")}</th>
            <th>{__("Modified At")}</th>
            <th>{__("")}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <Row
              key={item._id}
              indicatorsGroups={item}
              selectedItems={selectedItems}
              selectItem={selectItem}
              queryParams={queryParams}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  const { totalCount, queryParams } = props;
  const rightActionBar = (
    <BarItems>
      {renderSearchField()}
      {!!selectedItems.length && renderRemove()}
      {addIndicatorGroups()}
    </BarItems>
  );

  const leftActionBar = (
    <HeaderDescription
      title="Indicators Groups"
      icon="/images/actions/24.svg"
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

  const updatedProps = {
    title: "Indicators Groups",
    rightActionBar,
    leftActionBar,
    sidebar: <Sidebar queryParams={queryParams} />,
    content: renderContent(),
    totalCount,
    subMenu,
  };

  return <DefaultWrapper {...updatedProps} />;
};
export default List;
