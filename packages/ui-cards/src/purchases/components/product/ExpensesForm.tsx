import React from 'react';
import Icon from '@erxes/ui/src/components/Icon';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { __ } from 'coreui/utils';
import { Alert } from '@erxes/ui/src/utils';
import Select from 'react-select-plus';
import Table from '@erxes/ui/src/components/table';
import Button from '@erxes/ui/src/components/Button';
import { FormControl } from '@erxes/ui/src/components/form';

const ExpensesForm = ({
  costsQueryData,
  expensesData,
  onChangeExpensesData
}) => {
  const onChangeField = (field, value, expenseId: string) => {
    const updatedExpensesData = expensesData;
    if (updatedExpensesData) {
      const expenseData = updatedExpensesData.find(
        p => p.expenseId === expenseId
      );
      if (expenseData) {
        expenseData[field] = value;
      }
      onChangeExpensesData(updatedExpensesData);
    }
  };

  const deleteElement = index => {
    const newItems = [...expensesData];
    newItems.splice(index, 1);
    onChangeExpensesData(newItems);
  };

  const addElement = () => {
    if (!nameOptions.length) {
      Alert.error('Please fill expense refers');
      return;
    }

    const newElement = {
      type: typeOptions[0].value,
      name: nameOptions[0].value,
      price: 0,
      expenseId: Math.random().toString()
    };

    onChangeExpensesData([...expensesData, newElement]);
  };
  const options = [
    { value: 'quantity', label: 'by quantity' },
    { value: 'amount', label: 'by amount' }
  ];

  const nameOptions = costsQueryData.map(result => ({
    value: result.name,
    label: result.name
  }));

  const typeOptions = options.map(result => ({
    value: result.value,
    label: result.value
  }));

  return (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Type')}</th>
          <th>{__('Name')}</th>
          <th>{__('Price')}</th>
          <th>{__('Action')}</th>
        </tr>
      </thead>
      <tbody>
        {expensesData.map((element, index) => (
          <tr key={index}>
            <td>
              <Select
                placeholder={__('Select a type')}
                value={element.type}
                options={typeOptions}
                onChange={(value: any) =>
                  onChangeField('type', value.value, element.expenseId)
                }
                clearable={false}
              />
            </td>

            <td>
              <Select
                placeholder={__('Select a name')}
                value={element.name}
                options={nameOptions}
                onChange={(value: any) =>
                  onChangeField('name', value.value, element.expenseId)
                }
                clearable={false}
              />
            </td>
            <td>
              <FormControl
                type="text"
                defaultValue={element.price}
                placeholder="Enter price"
                onChange={(e: any) =>
                  onChangeField('price', e.target.value, element.expenseId)
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
        <LinkButton onClick={addElement}>
          <Icon icon="plus-1" /> {__('Add another expense')}
        </LinkButton>
      </tbody>
    </Table>
  );
};
export default ExpensesForm;
