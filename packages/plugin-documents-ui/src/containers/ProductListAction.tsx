import gql from 'graphql-tag';
import client from '@erxes/ui/src/apolloClient';
import { getEnv, __ } from '@erxes/ui/src/utils';
import { ActionButton, ActionItem } from '../styles';
import React from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { queries } from '../graphql';
import WithPermission from 'coreui/withPermission';
import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';

type Props = {
  bulk: any[];
  contentType: String;
};

type State = {
  documents: any[];
  loading: boolean;
  showPopup: boolean;
  selectedDocumentId: String;
  copies: number;
  width: number;
};

class BulkDocuments extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedDocumentId: '',
      documents: [],
      loading: false,
      showPopup: false,
      copies: 1,
      width: 400
    };
  }

  loadDocuments = () => {
    this.setState({ loading: true });

    client
      .mutate({
        mutation: gql(queries.documents),
        variables: { contentType: 'products' }
      })
      .then(({ data }) => {
        this.setState({ documents: data.documents });
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  print = () => {
    const { bulk } = this.props;
    const { selectedDocumentId, copies, width } = this.state;

    window.open(
      `${
        getEnv().REACT_APP_API_URL
      }/pl:documents/print?_id=${selectedDocumentId}&productIds=${JSON.stringify(
        bulk.map(b => b._id)
      )}&copies=${copies}&width=${width}`
    );
  };

  showPopup = selectedDocumentId => {
    this.setState({ showPopup: true, selectedDocumentId });
  };

  onChange = (name, e) => {
    this.setState({ [name]: e.currentTarget.value } as any);
  };

  renderPopup() {
    const { showPopup } = this.state;

    if (!showPopup) {
      return null;
    }

    const { bulk } = this.props;

    if (bulk.length === 0) {
      return null;
    }

    const content = () => {
      const { copies, width } = this.state;

      return (
        <div>
          <p>
            <p>Copies:</p>
            <input
              value={copies}
              onChange={this.onChange.bind(this, 'copies')}
            />
          </p>

          <p>
            <p>Width:</p>
            <input value={width} onChange={this.onChange.bind(this, 'width')} />
          </p>

          <Button onClick={this.print}>Print</Button>
        </div>
      );
    };

    return (
      <ModalTrigger
        title="Print documents"
        size="sm"
        isOpen={true}
        content={content}
      />
    );
  }

  render() {
    const { documents, loading } = this.state;

    const trigger = (
      <ActionButton onClick={this.loadDocuments}>
        {loading ? 'loading' : __('Print document')}
      </ActionButton>
    );

    return (
      <WithPermission action="manageDocuments">
        {this.renderPopup()}

        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-select">
            {trigger}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {documents.map(item => (
              <li key={item._id}>
                <ActionItem onClick={this.showPopup.bind(this, item._id)}>
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

export default BulkDocuments;
