import {
  Flex,
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import React, { useState } from "react";
import { __, getEnv } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Datetime from "@nateradebaugh/react-datetime";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { Label } from "@erxes/ui/src/components/form/styles";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import WithPermission from "@erxes/ui/src/components/WithPermission";
import client from "@erxes/ui/src/apolloClient";
import { colors } from "@erxes/ui/src/styles";
import { gql } from "@apollo/client";
import { queries } from "../../graphql";
import { rgba } from "@erxes/ui/src/styles/ecolor";
import styled from "styled-components";
import styledTS from "styled-components-ts";

export const ActionItem = styled.button`
  width: 100%;
  text-align: left;
  min-width: 150px;
  background: none;
  outline: 0;
  border: 0;
  overflow: hidden;

  > i {
    color: ${colors.colorCoreGreen};
    float: right;
  }
`;

export const ActionButton = styledTS<{ color?: string }>(styled.div)`
  height: 25px;
  border-radius: 2px;
  font-weight: 500;
  line-height: 25px;
  font-size: 12px;
  background-color: ${(props) => rgba(props.color || colors.colorPrimary, 0.1)};
  color: ${(props) => props.color || colors.colorPrimaryDark};
  padding: 0 10px;
  transition: background 0.3s ease;
  > i {
    margin-right: 5px;
  }
  > span {
    margin-right: 5px;
  }
  &:hover {
    cursor: pointer;
    background-color: ${(props) =>
      rgba(props.color || colors.colorPrimary, 0.2)};
  }
`;

type Props = {
  bulk: any[];
};

const BulkDocuments: React.FC<Props> = ({ bulk }: { bulk: any[] }) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [documents, setDocuments] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [copyInfos, setCopyInfos] = useState<
    Array<{ id: string; c: number; product: any }>
  >(
    (bulk || []).map((b) => ({
      id: b._id,
      c: 1,
      product: b,
    }))
  );
  const [copies, setCopies] = useState(
    Number(localStorage.getItem("erxes_products_documents_copies") || 1)
  );
  const [width, setWidth] = useState(
    Number(localStorage.getItem("erxes_products_documents_width") || 300)
  );
  const [isDate, setIsDate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [branchId, setBranchId] = useState(
    localStorage.getItem("erxes_products_documents_branchId") || ""
  );
  const [departmentId, setDepartmentId] = useState(
    localStorage.getItem("erxes_products_documents_departmentId") || ""
  );

  const loadDocuments = () => {
    setLoading(true);
    setShowPopup(false);
    setCopyInfos(
      (bulk || []).map((b) => ({
        id: b._id,
        c: 1,
        product: b,
      }))
    );

    client
      .mutate({
        mutation: gql(queries.documents),
        variables: { contentType: "core:product" },
      })
      .then(({ data }) => {
        setDocuments(data.documents);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const print = () => {
    window.open(
      `${
        getEnv().REACT_APP_API_URL
      }/pl:documents/print?_id=${selectedDocumentId}&productIds=${JSON.stringify(
        copyInfos.map((c) => ({ id: c.id, c: c.c }))
      )}&copies=${copies}&width=${width}&branchId=${branchId}&departmentId=${departmentId}&date=${date}&isDate=${
        isDate || ""
      }`
    );
  };

  const showPopupHandler = (selectedDocumentId) => {
    setShowPopup(true);
    setSelectedDocumentId(selectedDocumentId);
  };

  const onChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "copies") {
      setCopies(value);
      localStorage.setItem(`erxes_products_documents_copies`, value);
    }
    if (name === "width") {
      setWidth(value);
      localStorage.setItem(`erxes_products_documents_width`, value);
    }
  };

  const onChangeSelect = (name, value) => {
    if (name === "branchId") {
      setBranchId(value);
      localStorage.setItem(`erxes_products_documents_branchId`, value);
    }
    if (name === "departmentId") {
      setDepartmentId(value);
      localStorage.setItem(`erxes_products_documents_departmentId`, value);
    }
  };

  const focusNext = (index: number, val?: number) => {
    const length = bulk.length;

    let next = index + (val || 1);
    if (next >= length) {
      next = 0;
    }
    if (next < 0) {
      next = length - 1;
    }

    document
      .getElementsByClassName("canFocus")
      [next].getElementsByTagName("input")[0]
      .focus();
  };

  const onKeyDown = (ind, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        focusNext(ind, -1);
        return;
      }
      focusNext(ind);
    }
  };

  const renderPopup = () => {
    if (!showPopup) {
      return null;
    }

    if (bulk.length === 0) {
      return null;
    }

    const content = (formProps) => {
      return (
        <>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Copies</ControlLabel>
                <FormControl
                  {...formProps}
                  name="copies"
                  value={copies}
                  onChange={onChange}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Width</ControlLabel>
                <FormControl
                  {...formProps}
                  name="width"
                  value={width}
                  onChange={onChange}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Branch</ControlLabel>
                <SelectBranches
                  label={__("Choose branch")}
                  name="branchId"
                  multi={false}
                  initialValue={branchId}
                  onSelect={(branchId) => onChangeSelect("branchId", branchId)}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Department</ControlLabel>
                <SelectDepartments
                  label={__("Choose branch")}
                  name="departmentId"
                  multi={false}
                  initialValue={departmentId}
                  onSelect={(departmentId) =>
                    onChangeSelect("departmentId", departmentId)
                  }
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Date</ControlLabel>
                <Datetime
                  inputProps={{ placeholder: "Click to select a date" }}
                  dateFormat="YYYY-MM-DD"
                  timeFormat="HH:mm"
                  viewMode={"days"}
                  closeOnSelect={true}
                  utc={true}
                  input={true}
                  value={date || null}
                  onChange={(date) => setDate(new Date(date || ""))}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>is Date</ControlLabel>
                <FormControl
                  componentclass="checkbox"
                  required={true}
                  name="isDate"
                  checked={isDate}
                  onChange={(e) => setIsDate((e.target as any).checked)}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              {(copyInfos || []).map((copy, ind) => (
                <Flex key={ind} className="canFocus">
                  <Label>{`${copy.product.code} - ${copy.product.name}: `}</Label>
                  <FormControl
                    {...formProps}
                    align="right"
                    type="number"
                    min={0}
                    name="copy"
                    value={copy.c}
                    onKeyDown={onKeyDown.bind(this, ind)}
                    onFocus={(e) => (e.target as any).select()}
                    onChange={(e) =>
                      setCopyInfos(
                        copyInfos.map((c) =>
                          c.id === copy.id
                            ? {
                                ...c,
                                c: (e.target as any).value,
                              }
                            : c
                        )
                      )
                    }
                  />
                </Flex>
              ))}
            </FormColumn>
          </FormWrapper>
          <ModalFooter>
            <Button onClick={print}>Print</Button>
          </ModalFooter>
        </>
      );
    };

    return (
      <ModalTrigger
        title="Print documents"
        size="lg"
        isOpen={true}
        content={content}
      />
    );
  };

  const trigger = (
    <Button btnStyle="success" onClick={loadDocuments}>
      {__("Print document")}
    </Button>
  );

  return (
    <WithPermission action="manageDocuments">
      {renderPopup()}

      <Dropdown as={DropdownToggle} toggleComponent={trigger}>
        {documents.map((item) => (
          <li key={item._id}>
            <ActionItem onClick={showPopupHandler.bind(this, item._id)}>
              {item.name}
            </ActionItem>
          </li>
        ))}
      </Dropdown>
    </WithPermission>
  );
};

export default BulkDocuments;
