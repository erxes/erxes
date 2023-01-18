import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import React from 'react';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import { CustomSideContent } from '../../styles';
import { IOverallWorkDet } from '../types';
import { IQueryParams } from '@erxes/ui/src/types';
import { SidebarList as List } from '@erxes/ui/src/layout';
import { SidebarMainContent } from '@erxes/ui/src/layout/styles';
import { Wrapper } from '@erxes/ui/src/layout';
import { ScrolledContent } from '../../flow/styles';

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
          <Section.Title>{__('Informations')}</Section.Title>
        </CustomSideContent>
      );
    }

    return (
      <CustomSideContent wide={true} hasBorder={true}>
        <ScrolledContent>
          <Section.Title>
            {__('Informations')}
            <Section.QuickButtons>.</Section.QuickButtons>
          </Section.Title>
          <SidebarMainContent>
            <List id="OverallWorkRightSidebar">
              <CollapseContent
                title={__(
                  `Need side ( ${counts.minPotentialCount.toLocaleString()} )`
                )}
                open={true}
                full={true}
              >
                <Table>
                  <thead>
                    <tr>
                      <th>{__('Product')}</th>
                      <th>{__('UOM')}</th>
                      <th>{__('Count')}</th>
                      <th>{__('Reserve Rem')}</th>
                      <th>{__('Live Rem')}</th>
                      <th>{__('Potential Count')}</th>
                      <th>{__('DEF UOM')}</th>
                      <th>{__('DEF Count')}</th>
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
                        <td>{data.mainUom ? `${data.mainUom.code}` : ''}</td>
                        <td>{data.mainQuantity}</td>
                        <td>{data.reserveRem}</td>
                        <td>{data.liveRem}</td>
                        <td>{data.liveRem - data.quantity}</td>
                        <td>{data.uom ? `${data.uom.code}` : ''}</td>
                        <td>{data.quantity}</td>
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
                full={true}
              >
                <Table>
                  <thead>
                    <tr>
                      <th>{__('Product')}</th>
                      <th>{__('UOM')}</th>
                      <th>{__('Count')}</th>
                      <th>{__('Reserve Rem')}</th>
                      <th>{__('Live Rem')}</th>
                      <th>{__('Made Count')}</th>
                      <th>{__('DEF UOM')}</th>
                      <th>{__('DEF Count')}</th>
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
                        <td>{data.mainUom ? `${data.mainUom.code}` : ''}</td>
                        <td>{data.mainQuantity}</td>
                        <td>{data.reserveRem}</td>
                        <td>{data.liveRem}</td>
                        <td>
                          {data.quantity + data.reserveRem - data.liveRem}
                        </td>
                        <td>{data.uom ? `${data.uom.code}` : ''}</td>
                        <td>{data.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CollapseContent>
            </List>
          </SidebarMainContent>
        </ScrolledContent>
      </CustomSideContent>
    );
  }
}

export default DetailRightSidebar;
