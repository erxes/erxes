import client from '@erxes/ui/src/apolloClient';
import WithPermission from 'coreui/withPermission';
import gql from 'graphql-tag';
import { colors } from '@erxes/ui/src/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { queries } from '../graphql';
import { getEnv, __ } from '@erxes/ui/src/utils';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';

type Props = {
  item: any;
};

type FinalProps = {
  saveMutation;
} & Props;

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

const Button = styledTS<{ color?: string }>(styled.div)`
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

type State = {
  documents: any[];
  loading: boolean;
};

export default class Container extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = { documents: [], loading: false };
  }

  loadDocuments = () => {
    this.setState({ loading: true });

    client
      .mutate({
        mutation: gql(queries.documents),
        variables: { contentType: 'cards' }
      })
      .then(({ data }) => {
        this.setState({ documents: data.documents });
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  print = _id => {
    const { item } = this.props;

    window.open(
      `${getEnv().REACT_APP_API_URL}/pl:documents/print?_id=${_id}&itemId=${
        item._id
      }&stageId=${item.stageId}`
    );
  };

  render() {
    const { documents, loading } = this.state;

    const trigger = (
      <Button onClick={this.loadDocuments}>
        {loading ? 'loading' : __('Print document')}
      </Button>
    );

    return (
      <WithPermission action="manageDocuments">
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-select">
            {trigger}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {documents.map(item => (
              <li key={item._id}>
                <ActionItem onClick={this.print.bind(this, item._id)}>
                  {item.name}
                </ActionItem>
              </li>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </WithPermission>
    );
  }
}
