import Button from '@erxes/ui/src/components/Button';
import client from '@erxes/ui/src/apolloClient';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { gql } from '@apollo/client';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import WithPermission from 'coreui/withPermission';
import { __, getEnv } from '@erxes/ui/src/utils';
import { queries } from '../../graphql';

import { colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { rgba } from '@erxes/ui/src/styles/ecolor';

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

type Props = {
  bulk: any[];
};

type State = {
  documents: any[];
  loading: boolean;
  showPopup: boolean;
  selectedDocumentId: String;
  copies: number;
  width: number;
  branchId: string;
  departmentId: string;
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
      width: 300,
      branchId: localStorage.getItem('erxes_products_documents_branchId') || '',
      departmentId:
        localStorage.getItem('erxes_products_documents_departmentId') || ''
    };
  }

  loadDocuments = () => {
    this.setState({ loading: true, showPopup: false });

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
    const {
      selectedDocumentId,
      copies,
      width,
      branchId,
      departmentId
    } = this.state;

    window.open(
      `${
        getEnv().REACT_APP_API_URL
      }/pl:documents/print?_id=${selectedDocumentId}&productIds=${JSON.stringify(
        bulk.map(b => b._id)
      )}&copies=${copies}&width=${width}&branchId=${branchId}&departmentId=${departmentId}`
    );
  };

  showPopup = selectedDocumentId => {
    this.setState({ showPopup: true, selectedDocumentId });
  };

  onChange = (name, e) => {
    this.setState({ [name]: e.currentTarget.value } as any);
  };

  onChangeSelect = (name, value) => {
    this.setState({ [name]: value } as any, () => {
      localStorage.setItem(`erxes_products_documents_${name}`, value);
    });
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

    const content = formProps => {
      const { copies, width } = this.state;

      return (
        <>
          <FormGroup>
            <ControlLabel>Copies</ControlLabel>
            <FormControl
              {...formProps}
              name="copies"
              value={copies}
              onChange={this.onChange.bind(this, 'copies')}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Width</ControlLabel>
            <FormControl
              {...formProps}
              name="width"
              value={width}
              onChange={this.onChange.bind(this, 'width')}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label={__('Choose branch')}
              name="branchId"
              multi={false}
              initialValue={this.state.branchId}
              onSelect={branchId => this.onChangeSelect('branchId', branchId)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label={__('Choose branch')}
              name="departmentId"
              multi={false}
              initialValue={this.state.departmentId}
              onSelect={departmentId =>
                this.onChangeSelect('departmentId', departmentId)
              }
            />
          </FormGroup>
          <Button onClick={this.print}>Print</Button>
        </>
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
