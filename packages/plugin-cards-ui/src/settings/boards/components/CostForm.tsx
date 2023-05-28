import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  mutations,
  queries
} from '@erxes/ui-cards/src/settings/boards/graphql';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { LinkButton } from '@erxes/ui/src/styles/main';
import Modal from 'react-bootstrap/Modal';
import { __ } from 'coreui/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import Table from '@erxes/ui/src/components/table';

type array = {
  _id: string;
  name: string;
  code: string;
};

function CostForm() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [elements, setElements] = useState<array[]>([]);
  const [costMutation] = useMutation(gql(mutations.costAdd));
  const { data, loading } = useQuery(gql(queries.costs));
  useEffect(() => {
    if (data) {
      setElements(data.costs);
    }
  }, [data]);

  const [inputValues, setInputValues] = useState({
    _id: '',
    name: '',
    code: ''
  });

  const addElement = () => {
    const newElement = {
      _id: Math.random().toString(),
      code: inputValues.code,
      name: inputValues.name
    };
    setElements(prevElements => [...prevElements, newElement]);
    setInputValues({
      _id: '',
      code: '',
      name: ''
    });
  };

  const changeElement = (index, newValue1, newValue2) => {
    const updatedElements = [...elements];
    updatedElements[index] = {
      _id: elements[index]._id,
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
    const setData = elements.map((element, index) => {
      if (element.name === '' || element.code === '') {
        Alert.error('Please fill all fields');
        throw new Error('Please fill all fields');
      }
      return {
        name: element.name,
        code: element.code,
        _id: element._id
      };
    });
    event.preventDefault();
    confirm().then(() => {
      costMutation({ variables: { costObjects: setData } })
        .then(() => {
          Alert.success('Successfully created');
          handleClose();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  return (
    <>
      <Button btnStyle="primary" icon="list" onClick={handleShow}>
        Expenses
      </Button>
      <Modal
        centered
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{__('Add Expenses')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table whiteSpace="nowrap" hover={true}>
            <thead>
              <tr>
                <th>{__('Code')}</th>
                <th>{__('Name')}</th>
                <th>{__('Action')}</th>
              </tr>
            </thead>
            <tbody>
              {elements.map((element, index) => (
                <tr key={index}>
                  <td>
                    <FormControl
                      type="text"
                      placeholder="Enter Code"
                      defaultValue={element.code}
                      onChange={(e: any) =>
                        changeElement(index, e.target.value, element.name)
                      }
                    />
                  </td>
                  <td>
                    <FormControl
                      type="text"
                      defaultValue={element.name}
                      placeholder="Enter Name"
                      onChange={(e: any) =>
                        changeElement(index, element.code, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Button
                      block
                      btnStyle="simple"
                      type="button"
                      icon="times"
                      onClick={() => deleteElement(index)}
                    ></Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <LinkButton onClick={addElement}>
              <Icon icon="plus-1" /> {__('Add another expense')}
            </LinkButton>
          </Table>
          <Modal.Footer>
            <Button
              btnStyle="simple"
              size="small"
              icon="times-circle"
              onClick={handleClose}
            >
              {__('Cancel')}
            </Button>

            <Button btnStyle="success" onClick={handleSubmit} icon="checked-1">
              Save
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default CostForm;
