import { __, getEnv } from "@erxes/ui/src/utils";

import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import React from "react";
import WithPermission from "@erxes/ui/src/components/WithPermission";
import client from "@erxes/ui/src/apolloClient";
import { colors } from "@erxes/ui/src/styles";
import { gql } from "@apollo/client";
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
    background-color: ${(props) => rgba(props.color || colors.colorPrimary, 0.2)};
  }
`;

const DOCUMENTS_QUERY = gql`
  query documents(
    $page: Int
    $perPage: Int
    $contentType: String
    $subType: String
  ) {
    documents(
      page: $page
      perPage: $perPage
      contentType: $contentType
      subType: $subType
    ) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

type Props = {
  item: any;
  contentType: string;
  subType: string;
  path?: string;
};

type State = {
  documents: any[];
  loading: boolean;
};

export default class PrintActionButton extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { documents: [], loading: false };
  }

  loadDocuments = () => {
    const { item, contentType, subType } = this.props;
    this.setState({ loading: true });

    client
      .query({
        query: DOCUMENTS_QUERY,
        variables: { contentType, subType }
      })
      .then(({ data }) => {
        this.setState({ documents: data.documents });
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  print = (_id) => {
    const { item, path } = this.props;

    window.open(
      `${getEnv().REACT_APP_API_URL}/pl:documents/print?_id=${_id}&itemId=${
        item._id
      }&${path}`
    );
  };

  render() {
    const { documents, loading } = this.state;

    const trigger = (
      <ActionButton onClick={this.loadDocuments}>
        {loading ? "loading" : __("Print document")}
      </ActionButton>
    );

    return (
      <Dropdown as={DropdownToggle} toggleComponent={trigger}>
        {documents.map((item) => (
          <li key={item._id}>
            <ActionItem onClick={this.print.bind(this, item._id)}>
              {item.name}
            </ActionItem>
          </li>
        ))}
      </Dropdown>
    );
  }
}
