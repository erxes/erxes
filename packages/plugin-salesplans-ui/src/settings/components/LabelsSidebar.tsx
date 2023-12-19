import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __, router } from '@erxes/ui/src/utils';
import { Link } from 'react-router-dom';
import { SidebarFilters } from '../../styles';
import { SidebarList as List } from '@erxes/ui/src/layout';
import { Wrapper } from '@erxes/ui/src/layout';

interface Props {
  history: any;
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

class Sidebar extends React.Component<Props> {
  private timer?: NodeJS.Timer;

  clearCategoryFilter = () => {
    router.removeParams(
      this.props.history,
      'filterStatus',
      'minMultiplier',
      'maxMultiplier'
    );
  };

  setFilter = (name, value) => {
    router.removeParams(this.props.history, 'page');
    router.setParams(this.props.history, { [name]: value });
  };

  searchMultiplier = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const name = e.target.name;
    const value = e.target.value;

    this.timer = setTimeout(() => {
      this.setFilter(name, value);
    }, 500);
  };

  renderListItem(url: string, text: string) {
    return (
      <li>
        <Link
          to={url}
          className={window.location.href.includes(url) ? 'active' : ''}
        >
          {__(text)}
        </Link>
      </li>
    );
  }

  render() {
    const { queryParams } = this.props;

    return (
      <>
        <Section.Title>
          {__('Filters')}
          <Section.QuickButtons>
            {(router.getParam(this.props.history, 'filterStatus') ||
              router.getParam(this.props.history, 'minMulitiplier') ||
              router.getParam(this.props.history, 'maxMulitiplier')) && (
              <a href="#cancel" tabIndex={0} onClick={this.clearCategoryFilter}>
                <Tip text={__('Clear filter')} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
        <SidebarFilters>
          <List id="SettingsSidebar">
            <FormGroup>
              <ControlLabel>{__(`Min variable`)}</ControlLabel>
              <FormControl
                name="minMultiplier"
                type="number"
                min={0}
                required={false}
                defaultValue={queryParams.minMultiplier}
                onChange={this.searchMultiplier}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{__(`Max variable`)}</ControlLabel>
              <FormControl
                name="maxMultiplier"
                type="number"
                min={0}
                required={false}
                defaultValue={queryParams.maxMultiplier}
                onChange={this.searchMultiplier}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Status</ControlLabel>
              <FormControl
                name="filterStatus"
                componentClass="select"
                defaultValue={queryParams.filterStatus}
                required={false}
                onChange={e =>
                  this.setFilter(
                    'filterStatus',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option key={''} value={''}>
                  {' '}
                  {'All status'}{' '}
                </option>
                <option key={'active'} value={'active'}>
                  {' '}
                  {'active'}{' '}
                </option>
                <option key={'archived'} value={'archived'}>
                  {' '}
                  {'archived'}{' '}
                </option>
              </FormControl>
            </FormGroup>
          </List>
        </SidebarFilters>
      </>
    );
  }
}

export default Sidebar;
