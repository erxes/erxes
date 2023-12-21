import React from 'react';
import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Actions, InfoWrapper } from '@erxes/ui/src/styles/main';
import { IAttachment } from '@erxes/ui/src/types';
import { Alert, confirm, __ } from '@erxes/ui/src/utils';

import { Name } from '@erxes/ui-contacts/src/customers/styles';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import moment from 'moment';
import Dropdown from 'react-bootstrap/Dropdown';
import xss from 'xss';
import { IAsset } from '../../../common/types';
import { AssetContent, ContainerBox } from '../../../style';
import { Tip } from '@erxes/ui/src';
import { isEnabled } from '@erxes/ui/src/utils/core';
import AssetForm from '../../containers/AssetForm';
import AssignArticles from '../../containers/actions/Assign';

type Props = {
  asset: IAsset;
  remove: () => void;
  assignKbArticles: (doc: {
    ids: string[];
    data: any;
    callback: () => void;
  }) => void;
  history: any;
};

function BasicInfo({ asset, remove, assignKbArticles, history }: Props) {
  const renderVendor = vendor => {
    if (!vendor) {
      return (
        <li>
          <FieldStyle>{__(`Vendor`)}</FieldStyle>
          <SidebarCounter>-</SidebarCounter>
        </li>
      );
    }

    return (
      <li>
        <FieldStyle>{__(`Vendor`)}</FieldStyle>
        <SidebarCounter>{vendor.primaryName || ''}</SidebarCounter>
        <Button
          onClick={() => history.push(`/companies/detail/${vendor._id}`)}
          btnStyle="link"
          style={{ padding: '0', paddingLeft: '8px' }}
        >
          <Tip text="See Vendor Detail" placement="bottom">
            <Icon icon="rightarrow" />
          </Tip>
        </Button>
      </li>
    );
  };

  const renderView = (name, variable, extraField?: any) => {
    const defaultName = name.includes('count') ? 0 : '-';

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
        {extraField && extraField}
      </li>
    );
  };

  const renderAction = () => {
    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch(error => {
          Alert.error(error.message);
        });

    return (
      <Actions>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a href="#delete" onClick={onDelete}>
                {__('Delete')}
              </a>
            </li>
            {renderEditForm()}
            {isEnabled('knowledgebase') && renderKbDetail()}
          </Dropdown.Menu>
        </Dropdown>
      </Actions>
    );
  };

  const renderImage = (item: IAttachment) => {
    if (!item) {
      return null;
    }

    return <Attachment attachment={item} />;
  };

  const renderEditForm = () => {
    const content = props => <AssetForm {...props} asset={asset || {}} />;

    return (
      <ModalTrigger
        title="Edit basic info"
        trigger={
          <li>
            <a href="#edit">{__('Edit')}</a>
          </li>
        }
        size="lg"
        content={content}
      />
    );
  };

  const renderKbDetail = () => {
    const content = props => (
      <AssignArticles
        {...props}
        knowledgeData={asset?.knowledgeData}
        assignedArticleIds={asset.kbArticleIds}
        objects={[asset]}
        save={assignKbArticles}
      />
    );

    return (
      <ModalTrigger
        title="Edit Assigned Knowledgebase Articles"
        dialogClassName="modal-1000w"
        content={content}
        size="xl"
        trigger={
          <li>
            <a href="#assign">{__('Assign')}</a>
          </li>
        }
      />
    );
  };

  const changeAssetDetail = () => {
    return (
      <Button
        onClick={() =>
          history.push(`/settings/asset/detail/${asset.parent._id}`)
        }
        btnStyle="link"
        style={{ padding: '0', paddingLeft: '8px' }}
      >
        <Tip text="See Parent Asset Detail" placement="bottom">
          <Icon icon="rightarrow" />
        </Tip>
      </Button>
    );
  };

  const renderAssetContent = () => {
    if (!asset.description) {
      return null;
    }

    return (
      <AssetContent
        dangerouslySetInnerHTML={{
          __html: xss(asset.description)
        }}
      />
    );
  };

  return (
    <Sidebar.Section>
      <InfoWrapper>
        <Name>{asset.name}</Name>
        {renderAction()}
      </InfoWrapper>

      {renderImage(asset.attachment)}
      <SidebarList className="no-link">
        {renderView('Code', asset.code)}
        {renderView('Type', asset.type)}
        {renderView('Category', asset.category ? asset.category.name : '')}
        {renderView(
          'Parent',
          asset.parent ? asset.parent.name : '',
          asset.parent && changeAssetDetail()
        )}
        {renderView('Unit price', (asset.unitPrice || 0).toLocaleString())}
        {renderVendor(asset.vendor)}
        {renderView(
          'Create At',
          moment(asset.createdAt).format('YYYY-MM-DD HH:mm')
        )}
        <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
      </SidebarList>
      {renderAssetContent()}
    </Sidebar.Section>
  );
}

export default BasicInfo;
