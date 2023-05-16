import {
  BarItems,
  Button,
  FormControl,
  ModalTrigger,
  router,
  Table,
  __,
  confirm,
  Alert,
  Tip,
  Icon
} from '@erxes/ui/src';
import React from 'react';
import { IAsset, IAssetCategory } from '../../common/types';
import { DefaultWrapper } from '../../common/utils';
import Form from '../containers/Form';
import Row from './Row';
import SideBar from './SideBar';
import { Link } from 'react-router-dom';
import * as _loadash from 'lodash';
import MergeAsset from './Merge';
import { breadcrumb } from '../../common/constant';
import { Title } from '@erxes/ui/src/styles/main';
import { ContainerBox } from '../../style';
import AssignArticles from '../containers/AssignArticles';

type Props = {
  assets: IAsset[];
  assetsCount: number;
  history: any;
  queryParams: any;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { assetIds: string[] }, emptyBulk: () => void) => void;
  assignKbArticles: (
    doc: { assetIds: string[] },
    emptyBulk: () => void
  ) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IAsset[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
  currentCategory: IAssetCategory;
  currentParent: IAsset;
  mergeAssets: () => void;
  mergeAssetLoading;
};

type State = {
  searchValue?: string;
};

class List extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);
    this.state = {
      searchValue: this.props.searchValue
    };
  }

  renderRightActionBarTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      Add Assets
    </Button>
  );

  renderFormContent = props => {
    return <Form {...props} queryParams={this.props.queryParams} />;
  };

  renderRightActionBar = (
    <ModalTrigger
      title="Add Assets"
      trigger={this.renderRightActionBarTrigger}
      content={this.renderFormContent}
      autoOpenKey="showListFormModal"
      dialogClassName="transform"
      size="lg"
    />
  );

  renderRow() {
    const { assets, history, toggleBulk, bulk, assignKbArticles } = this.props;

    return assets.map(asset => (
      <Row
        history={history}
        key={asset._id}
        asset={asset}
        toggleBulk={toggleBulk}
        queryParams={this.props.queryParams}
        isChecked={bulk.includes(asset)}
        assignKbArticles={assignKbArticles}
      />
    ));
  }

  onChange = () => {
    const { toggleAll, assets } = this.props;
    toggleAll(assets, 'assets');
  };

  renderContent = () => {
    const { isAllSelected } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={this.onChange}
              />
            </th>
            <th>{__('Code')}</th>
            <th>{__('Name')}</th>
            <th>{__('Category')}</th>
            <th>{__('Parent')}</th>
            <th>{__('Unit Price')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );
  };

  assetsMerge = props => {
    const { bulk, mergeAssets, mergeAssetLoading } = this.props;

    return (
      <MergeAsset
        {...props}
        objects={bulk}
        save={mergeAssets}
        mergeAssetLoading={mergeAssetLoading}
      />
    );
  };

  assignArticles = props => {
    const { bulk, assignKbArticles } = this.props;

    return <AssignArticles {...props} objects={bulk} save={assignKbArticles} />;
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  removeAssets = assets => {
    const assetIds: string[] = [];

    assets.forEach(asset => {
      assetIds.push(asset._id);
    });

    this.props.remove({ assetIds }, this.props.emptyBulk);
  };

  assignKbArticles = assets => {
    const assetIds: string[] = [];

    assets.forEach(asset => {
      assetIds.push(asset._id);
    });

    this.props.assignKbArticles({ assetIds }, this.props.emptyBulk);
  };

  render() {
    const {
      bulk,
      queryParams,
      assetsCount,
      currentCategory,
      currentParent,
      history
    } = this.props;

    let rightActionBar = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />

        <Link to="/settings/importHistories?type=asset">
          <Button btnStyle="simple" icon="arrow-from-right">
            {__('Import items')}
          </Button>
        </Link>

        {this.renderRightActionBar}
      </BarItems>
    );

    if (bulk.length > 0) {
      const onClick = () => {
        confirm()
          .then(() => {
            this.removeAssets(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      };

      const mergeButton = (
        <Button btnStyle="primary" size="small" icon="merge">
          Merge
        </Button>
      );

      const assignButton = (
        <Button btnStyle="primary" size="small" icon="merge">
          Assign knowledgebase articles
        </Button>
      );

      rightActionBar = (
        <BarItems>
          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Asset"
              size="lg"
              dialogClassName="modal-1000w"
              trigger={mergeButton}
              content={this.assetsMerge}
            />
          )}

          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Remove
          </Button>

          <ModalTrigger
            title="Assign knowledgebase articles"
            size="lg"
            dialogClassName="modal-1000w"
            trigger={assignButton}
            content={this.assignArticles}
          />
        </BarItems>
      );
    }

    const handleClearParams = type => {
      router.setParams(history, { [`${type}Id`]: null });
    };

    const clearButton = type => (
      <Button btnStyle="link" onClick={() => handleClearParams(type)}>
        <Tip text={`Clear ${type}`}>
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );

    const leftActionBar = (
      <ContainerBox row>
        <Title>
          {currentCategory.name || currentParent.name || 'All Assets'}
        </Title>
        {!_loadash.isEmpty(currentCategory) && clearButton('category')}
        {!_loadash.isEmpty(currentParent) && clearButton('parent')}
      </ContainerBox>
    );

    const updatedProps = {
      title: 'List Assets',
      rightActionBar,
      leftActionBar,
      content: this.renderContent(),
      sidebar: <SideBar queryParams={queryParams} history={history} />,
      totalCount: assetsCount,
      breadcrumb: breadcrumb
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
