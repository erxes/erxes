import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import React from "react";
import { queries } from "../../graphql";
import { getEnv, __ } from "@erxes/ui/src/utils";
import { Button, Alert } from "@erxes/ui/src";
import { IStage } from "../../types";
import FormControl from "@erxes/ui/src/components/form/Control";
import { ControlLabel, FormGroup, Spinner, Table } from "@erxes/ui/src/components";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import Dialog from "@erxes/ui/src/components/Dialog";
import { ModalFooter } from "@erxes/ui/src/styles/main";

type Props = {
  items: any[];
  toggleModal: () => void;
  stage: IStage;
};

type State = {
  documents: any[];
  loading: boolean;
  selectedDocumentId: string;
  copies: number;
  width: number;
  brandId: string;
  branchId: string;
  departmentId: string;
  checkedItemIds: string[];
  checked: boolean;
  renderModal: boolean;
  toggleModal: () => void;
};

export default class StageModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      renderModal: false,
      documents: [],
      loading: false,
      checked: false,
      checkedItemIds: [],
      selectedDocumentId: "",
      copies: Number(
        localStorage.getItem("erxes_stages_documents_copies") || 1
      ),
      width: Number(
        localStorage.getItem("erxes_stages_documents_width") || 300
      ),
      brandId: localStorage.getItem("erxes_stages_documents_brandIds") || "",
      branchId: localStorage.getItem("erxes_stages_documents_branchIds") || "",
      departmentId: localStorage.getItem("erxes_stages_documents_departmentIds") || "",
      toggleModal: () => { }
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    client
      .query({
        query: gql(queries.documents),
        variables: { contentType: "sales", subType: "stage" }
      })
      .then(({ data }) => {
        this.setState({
          documents: data.documents,
          loading: false,
          selectedDocumentId: (data.documents || [])[0]?._id
        });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  onChangeCheckbox = (id: string, isChecked: boolean) => {
    const excludeCheckedIds = this.state.checkedItemIds.filter(chId => chId !== id)

    if (isChecked) {
      excludeCheckedIds.push(id);
    }
    this.setState({ checkedItemIds: excludeCheckedIds });
  };

  onChangeCheckboxAll = (isChecked: boolean) => {
    let all: string[] = [];

    if (isChecked) {
      all = this.props.items.map(i => i._id)
    }
    this.setState({ checkedItemIds: all });
  };

  onChange = e => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value } as any, () => {
      localStorage.setItem(`erxes_stages_documents_${name}`, value);
    });
  };

  onChangeCombo = (name, value) => {
    this.setState({ [name]: value } as any, () => {
      localStorage.setItem(`erxes_stages_documents_${name}s`, value);
    });
  };

  onchangeDocument = (e) => {
    this.setState({
      selectedDocumentId: (e.target as any).value,
    });
  };


  print = () => {
    const {
      checkedItemIds, selectedDocumentId,
      copies, width,
      brandId, branchId, departmentId
    } = this.state;

    const apiUrl = getEnv().REACT_APP_API_URL; // Replace this with your API URL
    if (!selectedDocumentId) return Alert.error("Please select document !!!");
    try {
      if (checkedItemIds.length === 0) {
        return Alert.error("Please select item !!!");
      }

      const url = `${apiUrl}/pl:documents/print?_id=${selectedDocumentId}&itemIds=${checkedItemIds}&stageId=${this.props.stage._id}&copies=${copies}&width=${width}&brandId=${brandId}&branchId=${branchId}&departmentId=${departmentId}&contentype=sales:stage`;

      // Open the URL in a new browser window
      window.open(url);
    } catch (error) {
      return Alert.error("An error occurred", error);
    }
  };

  render() {
    const { selectedDocumentId, documents, loading, checkedItemIds } = this.state;
    if (loading) {
      return <Spinner />
    }
    const { items, toggleModal } = this.props;

    return (
      <Dialog show={true} closeModal={toggleModal} title={__("Print document")}>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Copies</ControlLabel>
              <FormControl
                type="number"
                name="copies"
                required={true}
                autoFocus={true}
                onChange={this.onChange}
                value={this.state.copies}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Width</ControlLabel>
              <FormControl
                type="number"
                name="width"
                required={true}
                autoFocus={true}
                value={this.state.width}
                onChange={this.onChange}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Brand</ControlLabel>
              <SelectBrands
                label={__("Choose brands")}
                initialValue={this.state.brandId}
                name="brandId"
                customOption={{
                  label: "No Brand (noBrand)",
                  value: "noBrand"
                }}
                onSelect={brandId => this.onChangeCombo('brandId', brandId)}
                multi={false}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Branch</ControlLabel>
              <SelectBranches
                label={__("Choose branch")}
                initialValue={this.state.branchId}
                name="branchId"
                customOption={{
                  label: "No branch",
                  value: "noBranch"
                }}
                onSelect={branchId => this.onChangeCombo('branchId', branchId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Department</ControlLabel>
              <SelectDepartments
                label={__("Choose department")}
                initialValue={this.state.departmentId}
                name="departmentId"
                customOption={{
                  label: "No department",
                  value: "noDepartment"
                }}
                onSelect={departmentId => this.onChangeCombo('departmentId', departmentId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Select a document</ControlLabel>
              <FormControl
                componentclass="select"
                name="document"
                required={true}
                autoFocus={true}
                value={selectedDocumentId}
                options={documents.map(doc => ({ value: doc.id, label: doc.name }))}
                onChange={this.onchangeDocument}

              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <Table>
          <tr>
            <th>{__("Number")}</th>
            <th>{__("Name")}</th>
            <th><input
              type="checkbox"
              checked={checkedItemIds.length === items.length}
              onChange={event =>
                this.onChangeCheckboxAll(event.target.checked)
              }
            /></th>
          </tr>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td>{item.number}</td>
                <td>{item.name}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={checkedItemIds.includes(item._id)}
                    onChange={event =>
                      this.onChangeCheckbox(item._id, event.target.checked)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <ModalFooter>
            <Button onClick={this.print} icon="print">
              Print
            </Button>
          </ModalFooter>
        </Table>
      </Dialog>
    );
  }
}
