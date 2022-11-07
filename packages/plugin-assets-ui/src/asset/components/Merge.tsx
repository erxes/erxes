import Button from '@erxes/ui/src/components/Button';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Icon from '@erxes/ui/src/components/Icon';
import { Column, Columns, Title } from '@erxes/ui/src/styles/chooser';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { ASSET_INFO } from '../../common/constant';
import { InfoDetail } from '../../style';
import { Info, InfoTitle } from '@erxes/ui/src/styles/main';
import { IAsset, IAssetDoc as IAssetDocc } from '../../common/types';

type IAssetDoc = IAssetDocc & {};

type Props = {
  objects: IAsset[];
  mergeAssetLoading: boolean;
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
};

type State = {
  selectedValues: any;
};

class AssetsMerge extends React.Component<Props, State> {
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

    if (selectedValues.parent) {
      selectedValues.parentId = selectedValues.parent._id;
    }

    if (selectedValues.vendor) {
      selectedValues.vendorId = selectedValues.vendor._id;
    }

    this.props.save({
      ids: objects.map(asset => asset._id),
      data: { ...selectedValues },
      callback: () => {
        this.props.closeModal();
      }
    });
  };

  handleChange = (type: string, key: string, value: string) => {
    const selectedValues = { ...this.state.selectedValues };

    if (type === 'plus-1') {
      if (key === 'parent') {
        delete selectedValues.category;
      }
      if (key === 'category') {
        delete selectedValues.parent;
      }

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

  renderAsset = (asset: IAssetDoc, icon: string) => {
    const properties = ASSET_INFO.ALL;

    return (
      <React.Fragment>
        <Title>{asset.name}</Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!asset[key]) {
              return null;
            }

            return this.renderAssetProperties(key, asset[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  };

  renderAssetProperties(key: string, value: string, icon: string) {
    return (
      <li key={key} onClick={this.handleChange.bind(this, icon, key, value)}>
        {this.renderTitle(key)}
        {this.renderValue(key, value)}
        <Icon icon={icon} />
      </li>
    );
  }

  renderTitle(key: string) {
    const title = ASSET_INFO[key];

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field: string, value: any) {
    switch (field) {
      case 'category':
        return this.renderCategoryInfo(value);

      case 'parent':
        return this.renderParentInfo(value);

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

  renderParentInfo(value) {
    return (
      <Info>
        <InfoTitle>{__('Name')}</InfoTitle>
        <InfoTitle>{value.name}</InfoTitle>
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
    const { objects, closeModal, mergeAssetLoading } = this.props;

    const [asset1, asset2] = objects;

    return (
      <form onSubmit={this.save}>
        <Columns>
          <Column className="multiple">
            {this.renderAsset(asset1, 'plus-1')}
          </Column>

          <Column className="multiple">
            {this.renderAsset(asset2, 'plus-1')}
          </Column>

          <Column>{this.renderAsset(selectedValues, 'times')}</Column>
        </Columns>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>
          <Button
            type="submit"
            btnStyle="success"
            icon={mergeAssetLoading ? undefined : 'check-circle'}
            disabled={mergeAssetLoading}
          >
            {mergeAssetLoading && <SmallLoader />}
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default AssetsMerge;
