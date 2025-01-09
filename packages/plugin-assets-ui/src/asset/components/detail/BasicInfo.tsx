import { Actions, InfoWrapper } from '@erxes/ui/src/styles/main';
import { Alert, __, confirm } from '@erxes/ui/src/utils';
import { AssetContent, ContainerBox } from '../../../style';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import React, { useState } from 'react';

import AssetForm from '../../containers/AssetForm';
import AssignArticles from '../../containers/actions/Assign';
import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import Dropdown from '@erxes/ui/src/components/Dropdown';
import { IAsset } from '../../../common/types';
import { IAttachment } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import KnowledgeBase from '../../containers/detail/KnowledgeBase';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Name } from '@erxes/ui-contacts/src/customers/styles';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { Tip } from '@erxes/ui/src';
import { isEnabled } from '@erxes/ui/src/utils/core';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import xss from 'xss';
import KbArticleHistories from '../../containers/detail/KbArticleHistories';

type Props = {
  asset: IAsset;
  remove: () => void;
  assignKbArticles: (doc: {
    ids: string[];
    data: any;
    callback: () => void;
  }) => void;
};

function BasicInfo({ asset, remove, assignKbArticles }: Props) {
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const navigate = useNavigate();

  const renderVendor = (vendor) => {
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
          onClick={() => navigate(`/companies/detail/${vendor._id}`)}
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
        .catch((error) => {
          Alert.error(error.message);
        });

    const editForm = (props) => <AssetForm {...props} asset={asset || {}} />;
    const kbForm = (props) => (
      <AssignArticles
        {...props}
        knowledgeData={asset?.knowledgeData}
        assignedArticleIds={asset.kbArticleIds}
        objects={[asset]}
        save={assignKbArticles}
      />
    );

    const menuItems = [
      {
        title: 'Edit basic info',
        trigger: <a href="#edit">{__('Edit')}</a>,
        content: editForm,
        additionalModalProps: { size: 'lg' }
      },
      isEnabled('knowledgebase') && {
        title: 'Edit Assigned Knowledgebase Articles',
        trigger: <a href="#assign">{__('Assign')}</a>,
        content: kbForm,
        additionalModalProps: { className: 'modal-1000w', size: 'xl' }
      }
    ];

    return (
      <Actions>
        <Dropdown
          toggleComponent={
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          }
          modalMenuItems={menuItems}
        >
          <li>
            <a href="#delete" onClick={onDelete}>
              {__('Delete')}
            </a>
          </li>
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

  const changeAssetDetail = () => {
    return (
      <Button
        onClick={() => navigate(`/settings/asset/detail/${asset.parent._id}`)}
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

  const renderKbArticleHistories = () => {
    return (
      <ModalTrigger
        title="Knowledge base articles histories"
        trigger={<Icon icon="eye" />}
        content={() => <KbArticleHistories assetId={asset._id} />}
        size="lg"
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
        {renderView(
          'Knowledge Base',
          <Icon
            icon={showKnowledgeBase ? 'uparrow' : 'downarrow-2'}
            onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
          />
        )}
        {renderView('Knowledge Base Histories', renderKbArticleHistories())}
        {showKnowledgeBase && (
          <KnowledgeBase asset={asset} kbArticleIds={asset.kbArticleIds} />
        )}
        <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
      </SidebarList>
      {renderAssetContent()}
    </Sidebar.Section>
  );
}

export default BasicInfo;
