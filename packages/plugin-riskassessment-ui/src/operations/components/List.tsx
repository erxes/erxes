import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  ModalTrigger,
  Table,
  __,
  generateTree,
  router,
} from "@erxes/ui/src";

import { DefaultWrapper } from "../../common/utils";
import Form from "../containers/Form";
import React, { useState } from "react";
import Row from "./Row";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  list: any[];
  totalCount: number;
  loading: boolean;
  remove: (ids: string[]) => void;
};

const List = (props: Props) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(
    props.queryParams.searchValue || ""
  );

  const renderAddButton = () => {
    const trigger = <Button btnStyle="success">{__("Add Operation")}</Button>;

    const content = (props) => (
      <Form {...props} queryParams={props.queryParams} />
    );

    return (
      <ModalTrigger content={content} trigger={trigger} title="Add Operation" />
    );
  };

  const renderRemoveButton = () => {
    const handleRemove = () => {
      const { remove } = props;
      remove(selectedItems);
      setSelectedItems([]);
    };

    return (
      <Button btnStyle="danger" onClick={handleRemove}>
        {__("Remove")}
      </Button>
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

  const renderContent = () => {
    const { list } = props;
    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const branchIds = list.map((branch) => branch._id);
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

    const generateList = () => {
      return list.map((operation) =>
        !list.find((op) => op._id === operation.parentId)
          ? { ...operation, parent: null }
          : operation
      );
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
            <th>{__("Code")}</th>
            <th>{__("Name")}</th>
            <th>{__("Created At")}</th>
            <th>{__("Modified At")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {generateTree(generateList(), null, (operation, level) => (
            <Row
              key={operation._id}
              operation={operation}
              level={level}
              selectedItems={selectedItems}
              handleSelect={handleSelect}
              queryParams={props.queryParams}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  const { loading, totalCount } = props;

  const rightActionBar = (
    <BarItems>
      {renderSearchField()}
      {!!selectedItems.length && renderRemoveButton()}
      {renderAddButton()}
    </BarItems>
  );

  const leftActionBar = (
    <HeaderDescription
      title={__("Operations")}
      description=""
      icon="/images/actions/16.svg"
    />
  );

  const updateProps = {
    title: "Operations",
    leftActionBar,
    rightActionBar,
    content: renderContent(),
    loading,
    totalCount,
  };

  return <DefaultWrapper {...updateProps} />;
};

export default List;
