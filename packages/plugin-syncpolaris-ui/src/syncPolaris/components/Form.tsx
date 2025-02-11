import { Table, Wrapper } from "@erxes/ui/src";

import Button from "@erxes/ui/src/components/Button";
import Form from "@erxes/ui/src/components/form/Form";
import { FormControl } from "@erxes/ui/src/components/form";
import React from "react";
import Row from "./Row";

type Props = {
  toSyncPolaris: (type: string, items: any[]) => void;
  items;
  toggleAll: (targets: any[], containerId: string) => void;
  bulk: any[];
  toggleBulk: (targets: any[], toAdd: boolean) => void;
  emptyBulk: () => void;
  toCheckPolaris: (type: string) => void;
  isAllSelected: boolean;
  type;
  tablehead;
};
const TypeForm = (props: Props) => {
  const { items, bulk, toggleBulk, isAllSelected, type, tablehead } = props;

  const renderContent = () => {
    const onChange = () => {
      const { toggleAll, items } = props;
      toggleAll(items, "customers");
    };
    const onClickSync = (e) => {
      const { toSyncPolaris, toCheckPolaris, emptyBulk, type } = props;
      toSyncPolaris(type, bulk);
      emptyBulk();
      toCheckPolaris(type);
      e.preventDefault();
    };

    let actionBarLeft: React.ReactNode;
    if (bulk.length > 0) {
      actionBarLeft = (
        <Button btnStyle="success" icon="check-circle" onClick={onClickSync}>
          Sync
        </Button>
      );
    }

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    return (
      <>
        {actionBar}
        <Table $whiteSpace="nowrap" $bordered={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={onChange}
                />
              </th>
              {tablehead.map((head) => (
                <th key={head}>{head || ""}</th>
              ))}
            </tr>
          </thead>
          <tbody id="customers">
            {(items || []).map((item) => (
              <Row
                key={item._id}
                item={item}
                isChecked={bulk.includes(item)}
                toggleBulk={toggleBulk}
                type={type}
              />
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TypeForm;
