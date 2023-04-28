import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from '@erxes/ui/src/components/table';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { CostMutationResponse, CostsQueryResponse } from '../types';
import { FlexContent, FlexItem, Add } from '@erxes/ui/src/layout/styles';
import Icon from '@erxes/ui/src/components/Icon';

import {
  queries,
  mutations
} from '@erxes/ui-cards/src/settings/boards/graphql';

function CostForm() {
  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');
  const [id, setId] = useState('');
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const userQuery = useQuery(gql(queries.costs));
  const [costMutation] = useMutation(gql(mutations.costAdd));
  const [costDeleteMutation] = useMutation(gql(mutations.costRemove));

  const { costs } = userQuery.data;
  const [name, setName] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    const setData = {
      name: name,
      code: code
    };
    costMutation({ variables: { data: [setData] } })
      .then(() => {
        Alert.success('Successfully created');
      })
      .catch(e => {
        Alert.error(e.message);
      });

    setName('');
    setCode('');
  };

  const deleteRow = _id => {
    costDeleteMutation({ variables: { id: _id } })
      .then(() => {
        Alert.success('Successfully deleted');
      })
      .catch(e => {
        Alert.error(e.message);
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
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={code}
                placeholder="Enter Code"
                onChange={e => setCode(e.target.value)}
              />
              <input
                type="text"
                value={name}
                placeholder=" Enter Name"
                onChange={e => setName(e.target.value)}
              />
              <button>Add</button>
            </form>
          </div>
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>CODE</th>
                <th>NAME</th>
              </tr>

              {costs.map(cost => (
                <tr key={cost._id}>
                  <td>{cost._id}</td>
                  <td>{cost.name}</td>
                  <td>{cost.code}</td>
                  <td>
                    <td>
                      <button onClick={() => deleteRow(cost._id)}>
                        Delete
                      </button>
                    </td>
                  </td>
                </tr>
              ))}
            </thead>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary">Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CostForm;
