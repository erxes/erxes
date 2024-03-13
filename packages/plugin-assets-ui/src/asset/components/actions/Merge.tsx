import React from 'react';
import { IAsset, IAssetDoc as IAssetDocc } from '../../../common/types';
import Button from '@erxes/ui/src/components/Button';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Icon from '@erxes/ui/src/components/Icon';
import { Column, Columns, Title } from '@erxes/ui/src/styles/chooser';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import { ASSET_INFO } from '../../../common/constant';
import { InfoDetail } from '../../../style';
import { Info, InfoTitle } from '@erxes/ui/src/styles/main';

type IAssetDoc = IAssetDocc & {};

type Props = {
  objects: IAsset[];
  mergeAssetLoading: boolean;
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
};

function MergeAssets({ objects, mergeAssetLoading, save, closeModal }: Props) {
  const [selectedValues, setSelectedValues] = React.useState<any>({});
  const [asset1, asset2] = objects;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const values = { ...selectedValues };

    if (values.category) {
      values.categoryId = values.category._id;
    }

    if (values.parent) {
      values.parentId = values.parent._id;
    }

    if (values.vendor) {
      values.vendorId = values.vendor._id;
    }

    save({
      ids: objects.map(asset => asset._id),
      data: { ...values },
      callback: () => {
        closeModal();
      }
    });
  };

  const handleChange = (type: string, key: string, value: string) => {
    const values = { ...selectedValues };

    if (type === 'plus-circle') {
      if (key === 'parent') {
        delete values.category;
      }
      if (key === 'category') {
        delete values.parent;
      }

      values[key] = value;

      if (key === 'links') {
        const links = Object.assign({ ...values.links }, value);
        values[key] = links;
      }
    } else {
      delete values[key];
    }

    setSelectedValues(values);
  };

  const renderAsset = (asset: IAssetDoc, icon: string) => {
    const properties = ASSET_INFO.ALL;

    return (
      <React.Fragment>
        <Title>{asset.name || 'Name'}</Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!asset[key]) {
              return null;
            }

            return renderAssetProperties(key, asset[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  };

  const renderAssetProperties = (key: string, value: string, icon: string) => {
    return (
      <li key={key} onClick={handleChange.bind(this, icon, key, value)}>
        {renderTitle(key)}
        {renderValue(key, value)}
        <Icon icon={icon} />
      </li>
    );
  };

  const renderTitle = (key: string) => {
    const title = ASSET_INFO[key];

    return <InfoTitle>{title}:</InfoTitle>;
  };

  const renderValue = (field: string, value: any) => {
    switch (field) {
      case 'category':
        return renderCategoryInfo(value);

      case 'parent':
        return renderParentInfo(value);

      case 'vendor':
        return renderVendorInfo(value);

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  };

  const renderCategoryInfo = value => {
    return (
      <Info>
        <InfoTitle>{__('Name')}: </InfoTitle>
        <InfoDetail>{value.name}</InfoDetail>
      </Info>
    );
  };

  const renderParentInfo = value => {
    return (
      <Info>
        <InfoTitle>{__('Name')}</InfoTitle>
        <InfoTitle>{value.name}</InfoTitle>
      </Info>
    );
  };

  const renderVendorInfo = value => {
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
  };

  return (
    <form onSubmit={onSubmit}>
      <Columns>
        <Column className="multiple">
          {renderAsset(asset1, 'plus-circle')}
        </Column>

        <Column className="multiple">
          {renderAsset(asset2, 'plus-circle')}
        </Column>

        <Column>{renderAsset(selectedValues, 'times-circle')}</Column>
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

export default MergeAssets;
