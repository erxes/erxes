import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { mutations } from '@erxes/ui-cards/src/settings/boards/graphql';

type array = {
  name: string;
  code: string;
};

function CostForm() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [elements, setElements] = useState<array[]>([]);
  const [costMutation] = useMutation(gql(mutations.costAdd));
  const [inputValues, setInputValues] = useState({
    name: '',
    code: ''
  });
  const handleInputChange = event => {
    const { name, value } = event.target;
    setInputValues(prevInputValues => ({
      ...prevInputValues,
      [name]: value
    }));
  };

  const addElement = () => {
    const newElement = {
      code: inputValues.code,
      name: inputValues.name
    };
    setElements(prevElements => [...prevElements, newElement]);
    setInputValues({
      code: '',
      name: ''
    });
  };
  const changeElement = (index, newValue1, newValue2) => {
    const updatedElements = [...elements];
    updatedElements[index] = {
      code: newValue1,
      name: newValue2
    };

    setElements(updatedElements);
  };

  const deleteElement = index => {
    const updatedElements = [...elements];
    updatedElements.splice(index, 1);
    setElements(updatedElements);
  };

  const handleSubmit = event => {
    event.preventDefault();
    confirm().then(() => {
      costMutation({ variables: { costObjects: elements } })
        .then(() => {
          Alert.success('Successfully created');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Costs Accounting
      </Button>
      <Modal
        centered
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Costs Accounting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <input
              type="text"
              name="code"
              placeholder="Enter Code"
              value={inputValues.code}
              onChange={handleInputChange}
            ></input>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={inputValues.name}
              onChange={handleInputChange}
            ></input>
            <button onClick={addElement}>Add Element</button>
            {elements.map((element, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Enter Code"
                  value={element.code}
                  onChange={event =>
                    changeElement(index, event.target.value, element.name)
                  }
                />
                <input
                  type="text"
                  value={element.name}
                  placeholder="Enter Name"
                  onChange={event =>
                    changeElement(index, element.code, event.target.value)
                  }
                />
                <button onClick={() => deleteElement(index)}>Delete</button>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="secondary" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CostForm;
