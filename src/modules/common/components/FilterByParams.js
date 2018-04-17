import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { Icon, DataWithLoader, EmptyState } from 'modules/common/components';
import { router } from 'modules/common/utils';
import Filter from './filterableList/Filter';

const propTypes = {
  history: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  paramKey: PropTypes.string.isRequired,
  icon: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  searchable: PropTypes.bool,
  update: PropTypes.func
};

const PopoverContent = styled.div`
  > input {
    padding: 10px 20px;
  }
`;

class FilterByParams extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: ''
    };

    this.filterItems = this.filterItems.bind(this);
  }

  filterItems(e) {
    this.setState({ key: e.target.value });
    this.props.update();
  }

  renderItems() {
    const { history, fields, counts, paramKey, icon, searchable } = this.props;
    const { key } = this.state;

    if (fields.length === 0) {
      return <EmptyState icon="clipboard" text="No templates" size="full" />;
    }

    return (
      <PopoverContent>
        {searchable && <Filter onChange={this.filterItems} />}
        <SidebarList>
          {fields.map(field => {
            // filter items by key
            if (key && field.name.toLowerCase().indexOf(key) < 0) {
              return false;
            }

            return (
              <li key={field._id}>
                <a
                  tabIndex={0}
                  className={
                    router.getParam(history, [paramKey]) === field._id
                      ? 'active'
                      : ''
                  }
                  onClick={() => {
                    router.setParams(history, { [paramKey]: field._id });
                  }}
                >
                  {icon ? (
                    <Icon
                      erxes
                      icon={icon}
                      style={{ color: field.colorCode }}
                    />
                  ) : null}{' '}
                  {field.name}
                  <SidebarCounter>{counts[field._id]}</SidebarCounter>
                </a>
              </li>
            );
          })}
        </SidebarList>
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
        emptyText="No tags"
        emptyIcon="pricetag"
        size="small"
        objective={true}
      />
    );
  }
}

FilterByParams.propTypes = propTypes;

export default withRouter(FilterByParams);
