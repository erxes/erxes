import { Alert, confirm } from "@erxes/ui/src/utils";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  DialogContent,
  DialogWrapper,
  ModalFooter,
  ModalOverlay,
} from "@erxes/ui/src/styles/main";
import React, { Fragment, useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  mutations,
  queries,
} from "@erxes/ui-cards/src/settings/boards/graphql";

import Button from "@erxes/ui/src/components/Button";
import { FormControl } from "@erxes/ui/src/components/form";
import Icon from "@erxes/ui/src/components/Icon";
import { LinkButton } from "@erxes/ui/src/styles/main";
import Table from "@erxes/ui/src/components/table";
import { __ } from "coreui/utils";

type array = {
  _id: string;
  name: string;
  description: string;
};

function ExpensesForm() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [elements, setElements] = useState<array[]>([]);
  const [expenseMutation] = useMutation(gql(mutations.manageExpenses));
  const { data, loading } = useQuery(gql(queries.expenses));
  useEffect(() => {
    if (data) {
      setElements(data.expenses);
    }
  }, [data]);

  const [inputValues, setInputValues] = useState({
    _id: "",
    name: "",
    description: "",
  });

  const addElement = () => {
    const newElement = {
      _id: Math.random().toString(),
      name: inputValues.name,
      description: inputValues.description,
    };
    setElements((prevElements) => [...prevElements, newElement]);
    setInputValues({
      _id: "",
      name: "",
      description: "",
    });
  };

  const changeElement = (index, key, value) => {
    const updatedElements = [...elements];
    updatedElements[index] = {
      ...updatedElements[index],
      [key]: value,
    };
    setElements(updatedElements);
  };

  const deleteElement = (index) => {
    const updatedElements = [...elements];
    updatedElements.splice(index, 1);
    setElements(updatedElements);
  };

  const handleSubmit = (event) => {
    const setData = elements.map((element, index) => {
      if (!element.name) {
        Alert.error("Please fill all fields");
        throw new Error("Please fill all fields");
      }
      return {
        name: element.name,
        description: element.description,
        _id: element._id,
      };
    });
    event.preventDefault();
    confirm().then(() => {
      expenseMutation({ variables: { expenseDocs: setData } })
        .then(() => {
          Alert.success("Successfully created");
          handleClose();
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  return (
    <>
      <Button btnStyle="primary" icon="list" onClick={handleShow}>
        Expenses
      </Button>
      <Transition appear show={show} as={Fragment}>
        <Dialog
          open={show}
          as="div"
          onClose={handleClose}
          className={`relative z-10`}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ModalOverlay />
          </TransitionChild>
          <DialogWrapper>
            <DialogContent>
              <DialogPanel className={`dialog-size-sm`}>
                <DialogTitle as="h3">
                  {__("Manage Expenses")}
                  <Icon icon="times" size={24} onClick={handleClose} />
                </DialogTitle>

                <Table $whiteSpace="nowrap" $hover={true}>
                  <thead>
                    <tr>
                      <th>{__("Name")}</th>
                      <th>{__("Description")}</th>
                      <th>{__("Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(elements || []).map((element, index) => (
                      <tr key={index}>
                        <td>
                          <FormControl
                            type="text"
                            placeholder="Enter Name"
                            defaultValue={element.name}
                            onChange={(e: any) =>
                              changeElement(index, "name", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <FormControl
                            type="text"
                            defaultValue={element.description}
                            placeholder="Enter description"
                            onChange={(e: any) =>
                              changeElement(
                                index,
                                "description",
                                e.target.value
                              )
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
                    <Icon icon="plus-1" /> {__("Add another expense")}
                  </LinkButton>
                </Table>
                <ModalFooter className="dialog-description">
                  <Button
                    btnStyle="simple"
                    size="small"
                    icon="times-circle"
                    onClick={handleClose}
                  >
                    {__("Cancel")}
                  </Button>

                  <Button
                    btnStyle="success"
                    size="small"
                    onClick={handleSubmit}
                    icon="checked-1"
                  >
                    Save
                  </Button>
                </ModalFooter>
              </DialogPanel>
            </DialogContent>
          </DialogWrapper>
        </Dialog>
      </Transition>
    </>
  );
}

export default ExpensesForm;
