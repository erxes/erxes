import client from '@erxes/ui/src/apolloClient';
import WithPermission from 'coreui/withPermission';
import gql from 'graphql-tag';
import React from 'react';
import { queries } from '../graphql';
import { getEnv, __ } from '@erxes/ui/src/utils';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';
import { ActionButton, ActionItem } from '../styles';

type Props = {
  item: any;
};

type FinalProps = {
  saveMutation;
} & Props;

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
      <ActionButton onClick={this.loadDocuments}>
        {loading ? 'loading' : __('Print document')}
      </ActionButton>
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
