import { BarItems, FlexRightItem } from "@erxes/ui/src/layout/styles";
import { Flex, ModalFooter } from "@erxes/ui/src/styles/main";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import Table from "@erxes/ui/src/components/table";
// local
import { TableTransactionAdd } from "../../styles";
// erxes
import { __ } from "@erxes/ui/src/utils";

type Props = {
  submit: (
    departmentId: string,
    branchId: string,
    products: any,
    closeModal: any
  ) => void;
};

export default function ActionBarContent(props: Props) {
  const { submit } = props;

  const [branchId, setBranchId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [data, setData] = useState<any>([]);

  const handleDataChange = (index: number, key: string, value: any) => {
    const updatedData: any = [...data];
    updatedData[index][key] = value;
    setData(updatedData);
  };

  const handleAddSize = () => {
    setData([
      ...data,
      {
        productId: "",
        count: 0,
        isDebit: true,
        uom: "465",
      },
    ]);
  };

  const handleRemoveSize = () => {
    const updatedData: any = [...data];
    updatedData.splice(-1);
    setData(updatedData);
  };

  const renderForm = () => {
    return data.map((item: any, index: number) => {
      return (
        <tr key={index}>
          <td>
            <SelectProducts
              label="Choose product"
              name={`selectedProductId` + index}
              initialValue={item.productId}
              onSelect={(productId) =>
                handleDataChange(index, "productId", productId)
              }
              multi={false}
            />
          </td>
          <td>
            <FormControl
              name={`count` + index}
              type="number"
              value={item.count}
              onChange={(event: any) =>
                handleDataChange(index, "count", Number(event.target.value))
              }
              required
            />
          </td>
          <td>
            <FormControl
              checked={item.isDebit}
              componentclass="checkbox"
              onChange={(event: any) =>
                handleDataChange(index, "isDebit", event.target.checked)
              }
            />
          </td>
        </tr>
      );
    });
  };

  const content = (modalProps: any) => {
    const { closeModal } = modalProps;

    return (
      <div>
        <FormGroup>
          <ControlLabel>{__("Branch")}</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="selectedBranchIds"
            initialValue={branchId}
            onSelect={(branchId: any) => setBranchId(String(branchId))}
            multi={false}
            customOption={{ value: "", label: "All branches" }}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Department")}</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="selectedDepartmentIds"
            initialValue={departmentId}
            onSelect={(departmentId: any) =>
              setDepartmentId(String(departmentId))
            }
            multi={false}
            customOption={{ value: "", label: "All departments" }}
          />
        </FormGroup>

        <ControlLabel>{__("Products")}</ControlLabel>

        <TableTransactionAdd>
          <thead>
            <tr>
              <th>{__("PRODUCT")}</th>
              <th>{__("COUNT")}</th>
              <th>{__("DEBIT")}</th>
            </tr>
          </thead>
          <tbody>{renderForm()}</tbody>
        </TableTransactionAdd>

        <Flex>
          <FlexRightItem>
            <Button
              btnStyle="success"
              size="small"
              icon="plus"
              onClick={handleAddSize}
            ></Button>
            <Button
              btnStyle="danger"
              size="small"
              icon="minus"
              onClick={handleRemoveSize}
            ></Button>
          </FlexRightItem>
        </Flex>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            {__("Close")}
          </Button>
          <Button
            btnStyle="success"
            onClick={() => submit(departmentId, branchId, data, closeModal)}
            icon="check-circle"
            uppercase={false}
          >
            {__("Submit")}
          </Button>
        </ModalFooter>
      </div>
    );
  };

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add Transaction
    </Button>
  );

  return (
    <BarItems>
      <ModalTrigger
        title={__("Add Transaction")}
        trigger={trigger}
        autoOpenKey="showTransactionModal"
        content={content}
        size="lg"
      />
    </BarItems>
  );
}
