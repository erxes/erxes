import React from "react";
import { IAsset } from "../../common/types";
import {
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  router,
  __,
  ActionButtons,
} from "@erxes/ui/src";
import { isEnabled } from "@erxes/ui/src/utils/core";
import AssetForm from "../containers/AssetForm";
import AssignArticles from "../containers/actions/Assign";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  asset: IAsset;
  queryParams: any;
  isChecked: boolean;
  toggleBulk: (asset: IAsset, isChecked?: boolean) => void;
  assignKbArticles: (
    doc: { assetIds: string[] },
    emptyBulk: () => void
  ) => void;
};

const Row = (props: Props) => {
  const { asset, queryParams, isChecked, toggleBulk, assignKbArticles } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const { code, name, category, parent, childAssetCount, unitPrice } = asset;

  const renderKbAssignForm = () => {
    const articleContent = (articleProps) => (
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
        <Tip text={__("Assign Knowledgebase")} placement="bottom">
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
    navigate(`/settings/assets/detail/${asset._id}`);
  };

  const onCellClick = (e) => {
    e.stopPropagation();
  };

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(asset, e.target.checked);
    }
  };

  const handleParent = () => {
    let params: { assetId: string; categoryId?: string } = {
      assetId: asset._id,
    };

    if (queryParams.categoryId) {
      params.categoryId = undefined;
    }
    router.setParams(navigate, location, params);
  };

  const content = (formProps) => <AssetForm {...formProps} asset={asset} />;

  return (
    <tr onClick={onRowClick}>
      <td onClick={onCellClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{code}</td>
      <td>{name}</td>
      <td>{category ? category.name : ""}</td>
      <td>{parent ? parent.name : ""}</td>
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
          {isEnabled("knowledgebase") && renderKbAssignForm()}
          <ModalTrigger
            title="Edit basic info"
            trigger={
              <Button btnStyle="link">
                <Tip text={__("Edit")} placement="bottom">
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
};

export default Row;
