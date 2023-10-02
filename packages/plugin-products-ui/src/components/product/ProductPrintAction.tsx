import { Flex, FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { __, getEnv } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Datetime from '@nateradebaugh/react-datetime';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { Label } from '@erxes/ui/src/components/form/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import WithPermission from 'coreui/withPermission';
import client from '@erxes/ui/src/apolloClient';
import { colors } from '@erxes/ui/src/styles';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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
  copyInfos: { id: string; c: number; product: any }[];
  copies: number;
  width: number;
  branchId: string;
  departmentId: string;
  date: Date;
  isDate: boolean;
};

class BulkDocuments extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedDocumentId: '',
      documents: [],
      loading: false,
      showPopup: false,
      copyInfos: (props.bulk || []).map(b => ({
        id: b._id,
        c: 1,
        product: b
      })),
      copies: 1,
      width: 300,
      isDate: false,
      date: new Date(),
      branchId: localStorage.getItem('erxes_products_documents_branchId') || '',
      departmentId:
        localStorage.getItem('erxes_products_documents_departmentId') || ''
    };
  }

  loadDocuments = () => {
    this.setState({
      loading: true,
      showPopup: false,
      copyInfos: (this.props.bulk || []).map(b => ({
        id: b._id,
        c: 1,
        product: b
      }))
    });

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
    const {
      selectedDocumentId,
      copies,
      copyInfos,
      width,
      branchId,
      departmentId,
      isDate,
      date
    } = this.state;

    window.open(
      `${
        getEnv().REACT_APP_API_URL
      }/pl:documents/print?_id=${selectedDocumentId}&productIds=${JSON.stringify(
        copyInfos.map(c => ({ id: c.id, c: c.c }))
      )}&copies=${copies}&width=${width}&branchId=${branchId}&departmentId=${departmentId}&date=${date}&isDate=${isDate ||
        ''}`
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

  focusNext = (index: number, val?: number) => {
    const { bulk } = this.props;
    const length = bulk.length;

    let next = index + (val || 1);
    if (next >= length) {
      next = 0;
    }
    if (next < 0) {
      next = length - 1;
    }

    document
      .getElementsByClassName('canFocus')
      [next].getElementsByTagName('input')[0]
      .focus();
  };

  onKeyDown = (ind, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        this.focusNext(ind, -1);
        return;
      }
      this.focusNext(ind);
    }
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
      const { copies, width, copyInfos } = this.state;

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
                  onSelect={branchId =>
                    this.onChangeSelect('branchId', branchId)
                  }
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
              <FormGroup>
                <ControlLabel>Date</ControlLabel>
                <Datetime
                  inputProps={{ placeholder: 'Click to select a date' }}
                  dateFormat="YYYY-MM-DD"
                  timeFormat="HH:mm"
                  viewMode={'days'}
                  closeOnSelect
                  utc
                  input
                  value={this.state.date || null}
                  onChange={date =>
                    this.setState({ date: new Date(date || '') })
                  }
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>is Date</ControlLabel>
                <FormControl
                  componentClass="checkbox"
                  required={true}
                  name="isDate"
                  checked={this.state.isDate}
                  onChange={e =>
                    this.setState({ isDate: (e.target as any).checked })
                  }
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              {(copyInfos || []).map((copy, ind) => (
                <Flex className="canFocus">
                  <Label>{`${copy.product.code} - ${copy.product.name}: `}</Label>
                  <FormControl
                    {...formProps}
                    align="right"
                    type="number"
                    min={0}
                    name="copy"
                    value={copy.c}
                    onKeyDown={this.onKeyDown.bind(this, ind)}
                    onFocus={e => (e.target as any).select()}
                    onChange={e =>
                      this.setState({
                        copyInfos: copyInfos.map(c =>
                          c.id === copy.id
                            ? {
                                ...c,
                                c: (e.target as any).value
                              }
                            : c
                        )
                      })
                    }
                  />
                </Flex>
              ))}
            </FormColumn>
          </FormWrapper>
          <Button onClick={this.print}>Print</Button>
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
