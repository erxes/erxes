import moment from 'moment';
import queryString from 'query-string';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { CustomSideContent, MenuFooter, SidebarFilters } from '../../styles';
import { SidebarList as List } from '@erxes/ui/src/layout';
import { Wrapper } from '@erxes/ui/src/layout';
import { IQueryParams } from '@erxes/ui/src/types';
import Button from '@erxes/ui/src/components/Button';
import { IOverallWorkDet } from '../types';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import { SidebarMainContent } from '@erxes/ui/src/layout/styles';
import Table from '@erxes/ui/src/components/table';
import ControlLabel from '@erxes/ui/src/components/form/Label';

interface Props {
  overallWork?: IOverallWorkDet;
  queryParams: any;
  counts: any;
}

type State = {
  filterParams: IQueryParams;
};

const { Section } = Wrapper.Sidebar;

class DetailRightSidebar extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      filterParams: this.props.queryParams
    };
  }

  render() {
    const { overallWork, counts } = this.props;
    if (!overallWork) {
      return (
        <CustomSideContent wide={true} hasBorder={true}>
          <SidebarFilters>
            <Section.Title>{__('Filters')}</Section.Title>
          </SidebarFilters>
        </CustomSideContent>
      );
    }

    return (
      <CustomSideContent wide={true} hasBorder={true}>
        <SidebarFilters>
          <Section.Title>
            {__('Filters')}
            <Section.QuickButtons>
              {/* {this.isFiltered() && (
              <a href="#cancel" tabIndex={0} onClick={this.clearFilter}>
                <Tip text={__('Clear filter')} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )} */}
            </Section.QuickButtons>
          </Section.Title>
          <SidebarMainContent>
            <List id="OverallWorkRightSidebar">
              <CollapseContent
                title={__(
                  `Need side ( ${counts.minPotentialCount.toLocaleString()} )`
                )}
                open={true}
              >
                <Table>
                  <thead>
                    <tr>
                      <th>{__('Product')}</th>
                      <th>{__('Count')}</th>
                      <th>{__('Reserve Rem')}</th>
                      <th>{__('Live Rem')}</th>
                      <th>{__('Potential Count')}</th>
                    </tr>
                  </thead>
                  <tbody id="overallWorks">
                    {(overallWork.needProductsData || []).map(data => (
                      <tr key={Math.random()}>
                        <td>
                          {data.product
                            ? `${data.product.code} - ${data.product.name}`
                            : ''}
                        </td>
                        <td>{data.quantity}</td>
                        <td>{data.reserveRem}</td>
                        <td>{data.liveRem}</td>
                        <td>{data.liveRem - data.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CollapseContent>
              <CollapseContent
                title={__(
                  `Result side ( ${counts.maxMadeCount.toLocaleString()} )`
                )}
                open={true}
              >
                <Table>
                  <thead>
                    <tr>
                      <th>{__('Product')}</th>
                      <th>{__('Count')}</th>
                      <th>{__('Reserve Rem')}</th>
                      <th>{__('Live Rem')}</th>
                      <th>{__('Made Count')}</th>
                    </tr>
                  </thead>
                  <tbody id="overallWorks">
                    {(overallWork.resultProductsData || []).map(data => (
                      <tr key={Math.random()}>
                        <td>
                          {data.product
                            ? `${data.product.code} - ${data.product.name}`
                            : ''}
                        </td>
                        <td>{data.quantity}</td>
                        <td>{data.reserveRem}</td>
                        <td>{data.liveRem}</td>
                        <td>
                          {data.quantity + data.reserveRem - data.liveRem}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CollapseContent>
            </List>
          </SidebarMainContent>
          <MenuFooter>
            <Button
              block={true}
              btnStyle="success"
              uppercase={false}
              onClick={() => {}}
              icon="filter"
            >
              {__('Filter')}
            </Button>
          </MenuFooter>
        </SidebarFilters>
      </CustomSideContent>
    );
  }
}

export default DetailRightSidebar;
