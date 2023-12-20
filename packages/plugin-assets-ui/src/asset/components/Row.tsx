import React from 'react';
import { IAsset } from '../../common/types';
import {
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  router,
  __,
  ActionButtons
} from '@erxes/ui/src';
import { Badge, ContainerBox, MoreContainer } from '../../style';
import { isEnabled } from '@erxes/ui/src/utils/core';
import AssetForm from '../containers/AssetForm';
import AssignArticles from '../containers/actions/Assign';

type Props = {
  asset: IAsset;
  history: any;
  queryParams: any;
  isChecked: boolean;
  toggleBulk: (asset: IAsset, isChecked?: boolean) => void;
  assignKbArticles: (
    doc: { assetIds: string[] },
    emptyBulk: () => void
  ) => void;
};

function Row(props: Props) {
  const {
    asset,
    history,
    queryParams,
    isChecked,
    toggleBulk,
    assignKbArticles
  } = props;

  const { code, name, category, parent, childAssetCount, unitPrice } = asset;

  const renderKbAssignForm = () => {
    const articleContent = articleProps => (
      <AssignArticles
        {...articleProps}
        assignedArticleIds={asset.kbArticleIds}
        objects={[asset]}
        queryParams={queryParams}
        save={assignKbArticles}
      />
    );

    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Assign Knowledgebase')} placement="bottom">
          <Icon icon="light-bulb" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger
        title="Assign knowledgebase articles"
        size="lg"
        dialogClassName="modal-1000w"
        trigger={trigger}
        content={articleContent}
      />
    );
  };

  const onRowClick = () => {
    history.push(`/settings/assets/detail/${asset._id}`);
  };

  const onCellClick = e => {
    e.stopPropagation();
  };

  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(asset, e.target.checked);
    }
  };

  const handleParent = () => {
    if (queryParams.categoryId) {
      router.removeParams(history, 'categoryId');
    }
    router.setParams(history, { assetId: asset._id });
  };

  const content = formProps => <AssetForm {...formProps} asset={asset} />;

  return (
    <tr onClick={onRowClick}>
      <td onClick={onCellClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{code}</td>
      <td>{name}</td>
      <td>{category ? category.name : ''}</td>
      <td>{parent ? parent.name : ''}</td>
      <td>{(unitPrice || 0).toLocaleString()}</td>
      <td onClick={onCellClick}>
        <ActionButtons>
          {childAssetCount > 0 && (
            <Button btnStyle="link">
              <Tip text="See sub assets">
                <Icon icon="sitemap-1" onClick={handleParent} />
              </Tip>
              {/* <Badge>{childAssetCount}</Badge> */}
            </Button>
          )}
          {isEnabled('knowledgebase') && renderKbAssignForm()}
          <ModalTrigger
            title="Edit basic info"
            trigger={
              <Button btnStyle="link">
                <Tip text={__('Edit')} placement="bottom">
                  <Icon icon="edit-3" />
                </Tip>
              </Button>
            }
            size="lg"
            content={content}
          />
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
