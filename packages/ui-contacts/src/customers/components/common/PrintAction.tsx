import { __, getEnv } from "@erxes/ui/src/utils";

import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { ICompany } from "../../../companies/types";
import { ICustomer } from "../../types";
import React from "react";
import WithPermission from "@erxes/ui/src/components/WithPermission";
import { colors } from "@erxes/ui/src/styles";
import { gql } from "@apollo/client";
import { rgba } from "@erxes/ui/src/styles/ecolor";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { useQuery } from "@apollo/client";

const ActionItem = styled.button`
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

const ActionButton = styledTS<{ color?: string }>(styled.div)`
  height: 25px;
  border-radius: 2px;
  font-weight: 500;
  line-height: 25px;
  font-size: 12px;
  background-color: ${props => rgba(props.color || colors.colorPrimary, 0.1)};
  color: ${props => props.color || colors.colorPrimaryDark};
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
    background-color: ${props => rgba(props.color || colors.colorPrimary, 0.2)};
  }
`;
const documentsQuery = `
  query documents($contentType: String) {
    documents(contentType: $contentType) {
      _id
      name
    }
  }
`;

type Props = {
  coc: ICompany | ICustomer;
  contentType: string;
};

export default function PrintAction({ coc, contentType }: Props) {
  const { data, loading, error } = useQuery(gql(documentsQuery), {
    variables: { contentType }
  });

  const print = _id => {
    window.open(
      `${
        getEnv().REACT_APP_API_URL
      }/pl:documents/print?_id=${_id}&contentTypeId=${
        coc._id
      }&contentType=${contentType}`
    );
  };

  if (error) {
    return null;
  }

  const trigger = (
    <ActionButton>{loading ? "loading" : __("Print document")}</ActionButton>
  );
  const documents = data?.documents || ([] as { _id: string; name: string }[]);

  if (!documents?.length) {
    return null;
  }

  return (
    <WithPermission action="manageDocuments">
      <Dropdown as={DropdownToggle} toggleComponent={trigger}>
        {documents.map(document => {
          return (
            <li key={document._id}>
              <ActionItem onClick={print.bind(this, document._id)}>
                {document.name}
              </ActionItem>
            </li>
          );
        })}
      </Dropdown>
    </WithPermission>
  );
}
