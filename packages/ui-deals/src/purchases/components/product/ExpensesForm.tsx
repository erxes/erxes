import { Alert } from "@erxes/ui/src/utils";
import Button from "@erxes/ui/src/components/Button";
import { FormControl } from "@erxes/ui/src/components/form";
import React from "react";
import Select from "react-select";
import Table from "@erxes/ui/src/components/table";
import { __ } from "coreui/utils";

const ExpensesForm = ({
  expensesQueryData,
  expensesData,
  onChangeExpensesData,
}) => {
  const onChangeField = (field, value, expenseId: string) => {
    const updatedExpensesData = expensesData;
    if (updatedExpensesData) {
      const expenseData = updatedExpensesData.find((p) => p._id === expenseId);
      if (expenseData) {
        expenseData[field] = value;
      }
      onChangeExpensesData(updatedExpensesData);
    }
  };

  const deleteElement = (index) => {
    const newItems = [...expensesData];
    newItems.splice(index, 1);
    onChangeExpensesData(newItems);
  };

  const addElement = () => {
    if (!nameOptions.length) {
      Alert.error("Please fill expense refers");
      return;
    }

    const newElement = {
      _id: Math.random().toString(),
      type: typeOptions[0].value,
      name: nameOptions[0].value,
      value: 0,
    };

    onChangeExpensesData([...expensesData, newElement]);
  };
  const options = [
    { value: "quantity", label: "by quantity" },
    { value: "amount", label: "by amount" },
  ];

  const nameOptions = (expensesQueryData || []).map((result) => ({
    value: result.name,
    label: result.name,
  }));

  const typeOptions = options.map((result) => ({
    value: result.value,
    label: result.value,
  }));

  return (
    <>
      <Table $whiteSpace="nowrap" $hover={true}>
        <thead>
          <tr>
            <th>{__("Type")}</th>
            <th>{__("Name")}</th>
            <th>{__("Price")}</th>
            <th>{__("Action")}</th>
          </tr>
        </thead>
        <tbody>
          {(expensesData || []).map((element, index) => (
            <tr key={index}>
              <td>
                <Select
                  placeholder={__("Select a type")}
                  value={typeOptions.find(
                    (option) => option.value === element.type
                  )}
                  options={typeOptions}
                  onChange={(value: any) =>
                    onChangeField("type", value.value, element._id)
                  }
                  isClearable={false}
                />
              </td>

              <td>
                <Select
                  placeholder={__("Select a name")}
                  value={nameOptions.find(
                    (option) => option.value === element.name
                  )}
                  options={nameOptions}
                  onChange={(value: any) =>
                    onChangeField("name", value.value, element._id)
                  }
                  isClearable={false}
                />
              </td>
              <td>
                <FormControl
                  type="number"
                  defaultValue={element.value}
                  placeholder="Enter expense"
                  onChange={(e: any) =>
                    onChangeField("value", e.target.value, element._id)
                  }
                />
              </td>
              <td>
                <Button
                  btnStyle="simple"
                  type="button"
                  icon="times"
                  onClick={() => deleteElement(index)}
                ></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button
        btnStyle="simple"
        type="button"
        icon="plus-1"
        onClick={addElement}
      >
        {__("Add another expense")}
      </Button>
    </>
  );
};
export default ExpensesForm;
