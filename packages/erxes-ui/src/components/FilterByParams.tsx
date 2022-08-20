import React from 'react';
import { withRouter } from 'react-router-dom';
import { getParam, removeParams, setParams } from '../utils/router';
import { FieldStyle, SidebarCounter, SidebarList } from '../layout/styles';
import { IRouterProps } from '../types';
import DataWithLoader from './DataWithLoader';
import EmptyState from './EmptyState';
import Filter from './filterableList/Filter';
import Icon from './Icon';
import { PopoverContent, ChildList, ToggleIcon } from './filterableList/styles';

interface IProps extends IRouterProps {
  fields: any[];
  counts: any;
  paramKey: string;
  icon?: string;
  loading: boolean;
  searchable?: boolean;
  update?: () => void;
  multiple?: boolean;
  treeView?: boolean;
}

type State = {
  key: string;
  parentFieldIds: { [key: string]: boolean };
};

class FilterByParams extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      parentFieldIds: {}
    };
  }

  filterItems = e => {
    this.setState({ key: e.target.value });

    const { update } = this.props;

    if (update) {
      update();
    }
  };

  onClick = (id: string) => {
    const { history, paramKey, multiple } = this.props;

    if (!multiple) {
      setParams(history, { [paramKey]: id });
    } else {
      // multi select
      const value = getParam(history, [paramKey]);
      const params = value ? value.split(',') : [];

      if (params.includes(id)) {
        const index = params.indexOf(id);

        params.splice(index, 1);
      } else {
        params.push(id);
      }

      setParams(history, { [paramKey]: params.toString() });
    }

    removeParams(history, 'page');
  };

  groupByParent = (array: any[]) => {
    const key = 'parentId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  onToggle = (id: string, isOpen: boolean) => {
    const parentFieldIds = this.state.parentFieldIds;
    parentFieldIds[id] = !isOpen;

    this.setState({ parentFieldIds });
  };

  getCount(field: any, isOpen?: boolean) {
    const counts = this.props.counts;
    let count = counts[field._id];

    if (!this.props.treeView || isOpen) {
      return count;
    }

    if (field.relatedIds) {
      const relatedIds = field.relatedIds || [];

      for (const id of relatedIds) {
        count += counts[id];
      }
    }

    return count;
  }

  renderItems() {
    const {
      history,
      fields,
      paramKey,
      icon,
      searchable,
      multiple,
      treeView
    } = this.props;
    const { key } = this.state;

    if (fields.length === 0) {
      return <EmptyState icon={icon} text="No templates" size="full" />;
    }

    const renderFieldItem = (field: any, isOpen?: boolean) => {
      // filter items by key
      if (key && field.name.toLowerCase().indexOf(key) < 0) {
        return false;
      }

      if (!field._id || !field.name) {
        return null;
      }

      let className = '';
      const _id = field._id;
      const value = getParam(history, [paramKey]);

      if (value === _id) {
        className = 'active';
      } else if (multiple && value && value.includes(_id)) {
        className = 'active';
      }

      return (
        <li key={_id} title={field.name}>
          <a
            href="#param"
            tabIndex={0}
            className={className}
            onClick={this.onClick.bind(this, _id)}
          >
            {icon ? (
              <Icon icon={icon} style={{ color: field.colorCode }} />
            ) : null}{' '}
            <FieldStyle>{field.name}</FieldStyle>
            <SidebarCounter>{this.getCount(field, isOpen)}</SidebarCounter>
          </a>
        </li>
      );
    };

    const renderContent = () => {
      if (!treeView) {
        return fields.map(field => {
          return renderFieldItem(field);
        });
      }

      const subFields = fields.filter(f => f.parentId);
      const parents = fields.filter(f => !f.parentId);

      const groupByParent = this.groupByParent(subFields);

      const renderTree = field => {
        const childrens = groupByParent[field._id];

        if (childrens) {
          const isOpen = this.state.parentFieldIds[field._id];

          return (
            <SidebarList key={`parent-${field._id}`}>
              <ChildList>
                <ToggleIcon
                  onClick={this.onToggle.bind(this, field._id, isOpen)}
                  type="params"
                >
                  <Icon icon={isOpen ? 'angle-down' : 'angle-right'} />
                </ToggleIcon>

                {renderFieldItem(field, isOpen)}
                {isOpen &&
                  childrens.map(childField => {
                    return renderTree(childField);
                  })}
              </ChildList>
            </SidebarList>
          );
        }

        return renderFieldItem(field);
      };

      return parents.map(field => {
        return renderTree(field);
      });
    };

    return (
      <PopoverContent>
        {searchable && <Filter onChange={this.filterItems} />}

        <SidebarList>{renderContent()}</SidebarList>
      </PopoverContent>
    );
  }

  render() {
    const { fields, loading } = this.props;

    return (
      <DataWithLoader
        loading={loading}
        count={fields.length}
        data={this.renderItems()}
        emptyText="Empty"
        emptyIcon="folder-2"
        size="small"
        objective={true}
      />
    );
  }
}

export default withRouter<IProps>(FilterByParams);
