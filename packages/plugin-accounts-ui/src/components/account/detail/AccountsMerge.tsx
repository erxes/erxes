import Button from '@erxes/ui/src/components/Button';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Icon from '@erxes/ui/src/components/Icon';
import { Column, Columns, Title } from '@erxes/ui/src/styles/chooser';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { ACCOUNT_INFO } from '@erxes/ui-accounts/src/constants';
import { InfoDetail } from '../../../styles';
import { Info, InfoTitle } from '@erxes/ui/src/styles/main';
import { IAccount, IAccountDoc } from '../../../types';

type Props = {
  objects: IAccount[];
  mergeAccountLoading: boolean;
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
};

type State = {
  selectedValues: any;
};

class AccountsMerge extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedValues: {}
    };
  }

  save = (e: React.FormEvent) => {
    e.preventDefault();
    const { objects } = this.props;
    const selectedValues = { ...this.state.selectedValues };

    if (selectedValues.category) {
      selectedValues.categoryId = selectedValues.category._id;
    }

    if (selectedValues.vendor) {
      selectedValues.vendorId = selectedValues.vendor._id;
    }

    this.props.save({
      ids: objects.map(account => account._id),
      data: { ...selectedValues },
      callback: () => {
        this.props.closeModal();
      }
    });
  };

  handleChange = (type: string, key: string, value: string) => {
    const selectedValues = { ...this.state.selectedValues };

    if (type === 'plus-1') {
      selectedValues[key] = value;

      if (key === 'links') {
        const links = Object.assign(
          { ...this.state.selectedValues.links },
          value
        );
        selectedValues[key] = links;
      }
    } else {
      delete selectedValues[key];
    }

    this.setState({ selectedValues });
  };

  renderAccount = (account: IAccountDoc, icon: string) => {
    const properties = ACCOUNT_INFO.ALL;

    return (
      <React.Fragment>
        <Title>{account.name}</Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!account[key]) {
              return null;
            }

            return this.renderAccountProperties(key, account[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  };

  renderAccountProperties(key: string, value: string, icon: string) {
    return (
      <li key={key} onClick={this.handleChange.bind(this, icon, key, value)}>
        {this.renderTitle(key)}
        {this.renderValue(key, value)}
        <Icon icon={icon} />
      </li>
    );
  }

  renderTitle(key: string) {
    const title = ACCOUNT_INFO[key];

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field: string, value: any) {
    switch (field) {
      case 'category':
        return this.renderCategoryInfo(value);

      case 'vendor':
        return this.renderVendorInfo(value);

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  }

  renderCategoryInfo(value) {
    return (
      <Info>
        <InfoTitle>{__('Name')}: </InfoTitle>
        <InfoDetail>{value.name}</InfoDetail>
      </Info>
    );
  }

  renderVendorInfo(value) {
    return (
      <Info>
        <InfoTitle>{__('Info')}: </InfoTitle>
        <InfoDetail>
          {value.primaryName ||
            value.primaryEmail ||
            value.primaryPhone ||
            value.code}
        </InfoDetail>
      </Info>
    );
  }

  render() {
    const { selectedValues } = this.state;
    const { objects, closeModal, mergeAccountLoading } = this.props;

    const [account1, account2] = objects;

    return (
      <form onSubmit={this.save}>
        <Columns>
          <Column className="multiple">
            {this.renderAccount(account1, 'plus-1')}
          </Column>

          <Column className="multiple">
            {this.renderAccount(account2, 'plus-1')}
          </Column>

          <Column>{this.renderAccount(selectedValues, 'times')}</Column>
        </Columns>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>
          <Button
            type="submit"
            btnStyle="success"
            icon={mergeAccountLoading ? undefined : 'check-circle'}
            disabled={mergeAccountLoading}
          >
            {mergeAccountLoading && <SmallLoader />}
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default AccountsMerge;
