import {
  BarItems,
  Bulk,
  Button,
  CollapseContent,
  DateControl,
  Form as CommonForm,
  FormControl,
  ModalTrigger,
  SelectTeamMembers,
  Table,
  __
} from '@erxes/ui/src';

import {
  ContentColumn,
  ItemRow,
  ItemText
} from '@erxes/ui-cards/src/deals/styles';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import client from '@erxes/ui/src/apolloClient';
import {
  DateContainer,
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import _loadash from 'lodash';
import React from 'react';
import { IMovementItem, IMovementType } from '../../common/types';
import { CommonFormGroup, CommonItemRow } from '../../common/utils';
import {
  ContainerBox,
  MovementItemContainer,
  MovementTableWrapper
} from '../../style';
import AssetChooser from '../containers/Chooser';
import { queries } from '../graphql';
import MovementItems from './MovementItem';

type Props = {
  detail: IMovementType;
  assetId?: string;
  closeModal: () => void;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
};

type General = {
  branchId?: string;
  departmentId?: string;
  customerId?: string;
  companyId?: string;
  teamMemberId?: string;
};

type State = {
  variables: IMovementItem[];
  currentItems: string[];
  description: string;
  movedAt: string;
  selectedItemsIds: string[];
  general: General;
  checkedItems: string[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.assetChooser = this.assetChooser.bind(this);
    this.changeCurrentItem = this.changeCurrentItem.bind(this);

    const { detail, assetId } = props;

    const selectedItemsIds =
      detail?.items && detail.items.map(item => item.assetId);

    this.state = {
      variables: detail?.items || [],
      selectedItemsIds: selectedItemsIds || [],
      description: detail?.description || '',
      movedAt: detail?.movedAt || '',
      currentItems: [assetId],
      general: {},
      checkedItems: []
    };
  }

  generateDoc() {
    const { variables, movedAt, description } = this.state;
    const { detail } = this.props;
    const items = variables.map(
      ({
        assetId,
        branchId,
        departmentId,
        customerId,
        companyId,
        teamMemberId
      }) => ({
        assetId,
        branchId,
        departmentId,
        customerId,
        companyId,
        teamMemberId
      })
    );
    const doc = { items, description, movedAt };
    if (!_loadash.isEmpty(detail)) {
      return { _id: detail._id, doc };
    }
    return { ...doc };
  }

  assetChooser(props) {
    const handleSelect = datas => {
      const selectedItemsIds = datas.map(data => data._id);
      client
        .query({
          query: gql(queries.itemsCurrentLocation),
          fetchPolicy: 'network-only',
          variables: { assetIds: selectedItemsIds }
        })
        .then(res => {
          const { currentAssetMovementItems } = res.data;
          this.setState({ selectedItemsIds });

          const selectedItems = datas.map(data => ({
            assetId: data._id,
            assetDetail: {
              _id: data._id,
              name: data.name
            }
          }));

          const newVariables = selectedItems.map(selectedItem => {
            const newItem = currentAssetMovementItems.find(
              item => item.assetId === selectedItem.assetId
            );
            if (newItem) {
              return newItem;
            }
            return selectedItem;
          });

          this.setState({ variables: newVariables });
        });
    };

    const updatedProps = {
      ...props,
      handleSelect,
      selectedAssetIds: this.state.selectedItemsIds
    };

    return <AssetChooser {...updatedProps} />;
  }

  assetChooserTrigger = (<Button>Select Assets</Button>);

  assetChooserContent(trigger) {
    return (
      <ModalTrigger
        title="Select Assets"
        content={this.assetChooser}
        trigger={trigger}
        size="lg"
      />
    );
  }

  renderChooser() {
    return <>{this.assetChooserContent(this.assetChooserTrigger)}</>;
  }

  renderInfoSelection(label, asset, value) {
    let { variables } = this.state;

    let Selection;
    let field;
    let text = '';

    if (label === 'Branches') {
      Selection = SelectBranches;
      field = 'branchId';
      text = asset?.branch?.title;
    }
    if (label === 'Departments') {
      Selection = SelectDepartments;
      field = 'departmentId';
      text = asset?.department?.title;
    }
    if (label === 'Team Member') {
      Selection = SelectTeamMembers;
      field = 'teamMemberId';
      text = asset?.teamMember?.email;
    }
    if (label === 'Company') {
      Selection = SelectCompanies;
      field = 'companyId';
    }
    if (label === 'Customer') {
      Selection = SelectCustomers;
      field = 'customerId';
      text = asset?.customer?.primaryEmail;
    }

    const handleChange = selected => {
      variables = variables.map(item =>
        item.assetId === asset.assetId
          ? { ...item, [field]: selected === '' ? null : selected }
          : item
      );
      this.setState({ variables });
    };

    return (
      <ItemRow key={label} className="item">
        <ItemText>{label}</ItemText>
        <ContentColumn flex="3">
          <MovementItemContainer>
            <Selection
              label={`Choose ${label}`}
              onSelect={handleChange}
              initialValue={value || ''}
              multi={false}
              customOption={{ value: '', label: `Choose ${label}` }}
            />
          </MovementItemContainer>
        </ContentColumn>
      </ItemRow>
    );
  }

  changeCurrentItem(id: string) {
    const { currentItems } = this.state;

    if (currentItems.includes(id)) {
      const newCurrentItems = currentItems.filter(item => item !== id);
      return this.setState({ currentItems: newCurrentItems });
    }

    this.setState(prev => ({ currentItems: [...prev.currentItems, id] }));
  }

  handleGeneralDate = e => {
    this.setState({ movedAt: e });
  };

  handleGeneralDescription = e => {
    const { value } = e.currentTarget as HTMLInputElement;

    this.setState({ description: value });
  };

  handleChangeRowItem = (prevItemId, newItem) => {
    const { variables } = this.state;
    const newVariables = variables.map(item =>
      item.assetId === prevItemId ? newItem : item
    );
    const removedSeletedItemIds = this.state.selectedItemsIds.filter(
      item => item !== prevItemId
    );
    this.setState({
      variables: newVariables,
      selectedItemsIds: [...removedSeletedItemIds, newItem.assetId]
    });
  };

  renderGeneral() {
    const { variables, general, checkedItems } = this.state;

    const handleGeneralOptions = (value, field) => {
      this.setState({ currentItems: [] });

      const newVariables = variables.map(item =>
        checkedItems.includes(item.assetId)
          ? { ...item, [field]: value === '' ? null : value }
          : item
      );
      this.setState({
        variables: newVariables,
        general: { ...general, [field]: value === '' ? null : value }
      });
    };

    return (
      <CollapseContent
        title="General Location Configrations"
        description={__(
          'If you want to change the location generally of your selected assets, you should click checkboxes below.'
        )}
      >
        <BarItems>
          <ContentColumn>
            <FormWrapper>
              <FormColumn>
                <CommonItemRow label="Branch">
                  <SelectBranches
                    label="Choose Branch"
                    name="branchId"
                    onSelect={handleGeneralOptions}
                    multi={false}
                    initialValue={general?.branchId}
                    customOption={{ value: '', label: 'Choose Branch' }}
                  />
                </CommonItemRow>
              </FormColumn>
              <FormColumn>
                <CommonItemRow label="Department">
                  <SelectDepartments
                    label="Choose Department"
                    name="departmentId"
                    onSelect={handleGeneralOptions}
                    multi={false}
                    initialValue={general?.departmentId}
                    customOption={{ value: '', label: 'Choose Department' }}
                  />
                </CommonItemRow>
              </FormColumn>
            </FormWrapper>
            <FormWrapper>
              <FormColumn>
                <CommonItemRow label="Customer">
                  <SelectCustomers
                    label="Choose Customer"
                    name="customerId"
                    onSelect={handleGeneralOptions}
                    multi={false}
                    initialValue={general?.customerId}
                    customOption={{ value: '', label: 'Choose Customer' }}
                  />
                </CommonItemRow>
              </FormColumn>
              <FormColumn>
                <CommonItemRow label="Company">
                  <SelectCompanies
                    label="Choose Company"
                    name="companyId"
                    onSelect={handleGeneralOptions}
                    multi={false}
                    initialValue={general?.companyId}
                    customOption={{ value: '', label: 'Choose Company' }}
                  />
                </CommonItemRow>
              </FormColumn>
            </FormWrapper>
            <CommonItemRow label="Team Member">
              <SelectTeamMembers
                label="Choose Team Member"
                name="teamMemberId"
                onSelect={handleGeneralOptions}
                multi={false}
                initialValue={general?.teamMemberId}
                customOption={{ value: '', label: 'Choose Team Member' }}
              />
            </CommonItemRow>
          </ContentColumn>
        </BarItems>
      </CollapseContent>
    );
  }

  renderRow() {
    const {
      variables,
      currentItems,
      selectedItemsIds,
      checkedItems
    } = this.state;
    const removeRow = id => {
      const newVariables = variables.filter(item => item.assetId !== id);
      const newSelectedItems = selectedItemsIds.filter(itemId => itemId !== id);
      if (currentItems.includes(id)) {
        const newCurrentItems = currentItems.filter(item => item !== id);
        this.setState({ currentItems: newCurrentItems });
      }
      this.setState({
        variables: newVariables,
        selectedItemsIds: newSelectedItems
      });
    };
    const onChangeCheckedItems = (id: string) => {
      if (checkedItems.includes(id)) {
        return this.setState({
          checkedItems: checkedItems.filter(item => item !== id)
        });
      }
      return this.setState({ checkedItems: [...checkedItems, id] });
    };

    return variables.map(item => (
      <MovementItems
        key={item.assetId}
        item={item}
        current={currentItems.includes(item.assetId) ? item.assetId : ''}
        changeCurrent={this.changeCurrentItem}
        removeRow={removeRow}
        selectedItems={selectedItemsIds}
        isChecked={checkedItems.includes(item.assetId)}
        onChangeBulkItems={onChangeCheckedItems}
        handleChangeRowItem={this.handleChangeRowItem}
      >
        {this.renderInfoSelection('Branches', item, item['branchId'])}
        {this.renderInfoSelection('Departments', item, item['departmentId'])}
        {this.renderInfoSelection('Customer', item, item['customerId'])}
        {this.renderInfoSelection('Company', item, item['companyId'])}
        {this.renderInfoSelection('Team Member', item, item['teamMemberId'])}
      </MovementItems>
    ));
  }

  renderList() {
    const { variables, checkedItems } = this.state;

    const onChange = () => {
      const { checkedItems } = this.state;
      const newCheckedItems = variables.map(item => item.assetId);
      this.setState({
        checkedItems: checkedItems.length > 0 ? [] : newCheckedItems
      });
    };

    return (
      <MovementTableWrapper>
        <Table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <FormControl
                  checked={
                    variables.length > 0 &&
                    variables.length === checkedItems.length
                  }
                  componentClass="checkbox"
                  onChange={onChange}
                  color="#3B85F4"
                />
              </th>
              <th>{__('Name')}</th>
              <th>{__('Branch')}</th>
              <th>{__('Departmnet')}</th>
              <th>{__('Customer')}</th>
              <th>{__('Comapny')}</th>
              <th>{__('Team Member')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </MovementTableWrapper>
    );
  }
  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, detail } = this.props;
    const { isSubmitted } = formProps;
    const { movedAt, description, variables } = this.state;

    return (
      <ContainerBox column gap={20}>
        <FormWrapper>
          <FormColumn>
            <CommonFormGroup label="Date">
              <DateContainer>
                <DateControl
                  placeholder="Select Date"
                  onChange={this.handleGeneralDate}
                  value={movedAt}
                />
              </DateContainer>
            </CommonFormGroup>
          </FormColumn>
          <FormColumn>
            <CommonFormGroup label="Description">
              <FormControl
                type="text"
                name="description"
                onChange={this.handleGeneralDescription}
                value={description}
                required
              />
            </CommonFormGroup>
          </FormColumn>
        </FormWrapper>

        {variables.length > 0 && this.renderGeneral()}
        {this.renderList()}

        <ContainerBox justifyCenter>
          {this.assetChooserContent(
            <Button icon="plus-circle">{__('Add Asset')}</Button>
          )}
        </ContainerBox>
        {renderButton && (
          <ModalFooter>
            <Button btnStyle="simple" onClick={() => closeModal()}>
              Cancel
            </Button>
            {renderButton({
              text: 'Movement',
              values: this.generateDoc(),
              isSubmitted,
              callback: closeModal,
              object: !_loadash.isEmpty(detail)
            })}
          </ModalFooter>
        )}
      </ContainerBox>
    );
  };
  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
