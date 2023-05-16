import React from 'react';
import {
  ModalTrigger,
  Icon,
  FormControl,
  Button,
  Tip,
  router
} from '@erxes/ui/src';
import { IAsset } from '../../common/types';
import AssetForm from '../containers/Form';
import { MoreContainer, Badge, ContainerBox } from '../../style';
import AssignArticles from '../containers/AssignArticles';
import { isEnabled } from '@erxes/ui/src/utils/core';
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

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderKbAssignForm() {
    const { asset, assignKbArticles, queryParams } = this.props;

    const content = props => (
      <AssignArticles
        {...props}
        assignedArticleIds={asset.kbArticleIds}
        objects={[asset]}
        queryParams={queryParams}
        save={assignKbArticles}
      />
    );

    const trigger = <Icon icon="light-bulb" />;

    return (
      <ModalTrigger
        title="Assign knowledgebase articles"
        size="lg"
        dialogClassName="modal-1000w"
        trigger={trigger}
        content={content}
      />
    );
  }
  render() {
    const { asset, history, queryParams, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(asset, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      history.push(`/settings/assets/detail/${asset._id}`);
    };

    const handleParent = () => {
      if (queryParams.categoryId) {
        router.removeParams(history, 'categoryId');
      }
      router.setParams(history, { parentId: this.props.asset._id });
    };

    const content = props => <AssetForm {...props} asset={asset} />;

    const { code, name, category, parent, childAssetCount, unitPrice } = asset;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
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
        <td onClick={onClick}>
          <ContainerBox row gap={10} justifyEnd>
            {childAssetCount > 0 && (
              <MoreContainer>
                <Button btnStyle="link" onClick={handleParent}>
                  <Tip text="See sub assets">
                    <Icon icon="sitemap-1" />
                  </Tip>
                </Button>
                <Badge>{childAssetCount}</Badge>
              </MoreContainer>
            )}
            {isEnabled('knowledgebase') && this.renderKbAssignForm()}
            <ModalTrigger
              title="Edit basic info"
              trigger={<Icon icon="edit" />}
              enforceFocus={false}
              size="lg"
              content={content}
            />
          </ContainerBox>
        </td>
      </tr>
    );
  }
}
export default Row;
