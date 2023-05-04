import React, { useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from '@erxes/ui-cards/src/purchase/graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';

type array = {
  type: string;
  name: string;
  expenseId: string;
  price: string;
};
const ExpensesForm = ({ costsQueryData, _id }) => {
  const [elements, setElements] = useState<array[]>([]);
  const [costMutation] = useMutation(gql(mutations.purchasesEdit));
  const [inputValues, setInputValues] = useState({
    type: '',
    name: '',
    expenseId: '',
    price: ''
  });
  const options = [
    { value: 'options1', label: 'options1' },
    { value: 'options2', label: 'options2' },
    { value: 'options3', label: 'options3' }
  ];

  const handleInputChange = event => {
    const { name, value } = event.target;
    setInputValues(prevInputValues => ({
      ...prevInputValues,
      [name]: value
    }));
  };

  const addElement = () => {
    const newElement = {
      type: inputValues.type,
      name: inputValues.name,
      expenseId: inputValues.expenseId,
      price: inputValues.price
    };
    setElements(prevElements => [...prevElements, newElement]);
    setInputValues({
      type: '',
      name: '',
      expenseId: '',
      price: ''
    });
  };
  const changeElement = (index, newValue1, newValue2, newValue3, newValue4) => {
    const updatedElements = [...elements];
    updatedElements[index] = {
      type: newValue1,
      name: newValue2,
      expenseId: newValue3,
      price: newValue4
    };

    setElements(updatedElements);
  };

  const deleteElement = index => {
    const updatedElements = [...elements];
    updatedElements.splice(index, 1);
    setElements(updatedElements);
  };

  const SaveButton = event => {
    event.preventDefault();
    costMutation({
      variables: {
        _id: _id,
        costsData: elements
      }
    })
      .then(() => {
        Alert.success('Successfully created');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <div>
      <select name="type" value={inputValues.type} onChange={handleInputChange}>
        <option value="⬇️ Select a type ⬇️"> -- Select a type -- </option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select name="name" value={inputValues.name} onChange={handleInputChange}>
        <option value="⬇️ Select a name ⬇️"> -- Select a name -- </option>
        {costsQueryData.map(result => (
          <option key={result._id} value={result.name}>
            {result.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="expenseId"
        placeholder="Enter expenseId"
        value={inputValues.expenseId}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="price"
        placeholder="Enter price"
        value={inputValues.price}
        onChange={handleInputChange}
      />
      <button onClick={addElement}>Add Element</button>
      {elements.map((element, index) => (
        <div key={index}>
          <select
            value={element.type}
            onChange={event =>
              changeElement(
                index,
                event.target.value,
                element.name,
                element.expenseId,
                element.price
              )
            }
          >
            <option value="⬇️ Select a type ⬇️"> -- Select a type -- </option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={element.name}
            onChange={event =>
              changeElement(
                index,
                element.type,
                event.target.value,
                element.expenseId,
                element.price
              )
            }
          >
            <option value="⬇️ Select a name ⬇️"> -- Select a name -- </option>
            {costsQueryData.map(result => (
              <option key={result._id} value={result.name}>
                {result.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Enter expenseId"
            value={element.expenseId}
            onChange={event =>
              changeElement(
                index,
                element.type,
                element.name,
                event.target.value,
                element.price
              )
            }
          />
          <input
            type="text"
            value={element.price}
            placeholder="Enter price"
            onChange={event =>
              changeElement(
                index,
                element.type,
                element.name,
                element.expenseId,
                event.target.value
              )
            }
          />
          <button
            onClick={() =>
              changeElement(
                index,
                element.type,
                element.name,
                element.expenseId,
                element.price
              )
            }
          >
            Change Element
          </button>
          <button onClick={() => deleteElement(index)}>Delete</button>
        </div>
      ))}

      <div>
        <button onClick={SaveButton}>Save</button>
      </div>
    </div>
  );
};
export default ExpensesForm;
