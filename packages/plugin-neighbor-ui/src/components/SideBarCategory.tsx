import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Box from '@erxes/ui/src/components/Box';
import { SidebarList, FieldStyle } from '@erxes/ui/src/layout/styles';
import { router } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

interface IRouterProps {
  history: any;
  location: any;
  match: any;
}

const { Section } = Wrapper.Sidebar;

type Props = {} & IRouterProps;
type State = {};

class SidebarCategories extends React.Component<Props, State> {
  renderCategoryHeader() {
    return (
      <>
        <Section.Title>{__('Type')}</Section.Title>
      </>
    );
  }

  renderSidebar() {
    const onClick = type => {
      const { history } = this.props;
      router.setParams(history, { type });
    };

    return (
      <>
        <Sidebar wide={true} header={<SidebarHeader />} hasBorder>
          <Section noShadow noMargin maxHeight={488}>
            {this.renderCategoryHeader()}
          </Section>
          <Box title={__('Хөрш сургуулиуд')} collapsible={false}>
            <SidebarList>
              <li>
                <a id="kindergarden" onClick={() => onClick('kindergarden')}>
                  <FieldStyle>Цэцэрлэг</FieldStyle>
                </a>
              </li>
              <li>
                <a id="school" onClick={() => onClick('school')}>
                  <FieldStyle>Бүрэн дунд сургууль</FieldStyle>
                </a>
              </li>
              <li>
                <a id="university" onClick={() => onClick('university')}>
                  <FieldStyle>Их дээд сургууль</FieldStyle>
                </a>
              </li>
            </SidebarList>
          </Box>
          <Box title={__('Ойр хавийн мэдээлэл')}>
            <SidebarList>
              <li>
                <a id="soh" onClick={() => onClick('soh')}>
                  <FieldStyle>СӨХ</FieldStyle>
                </a>
              </li>
              <li>
                <a id="khoroo" onClick={() => onClick('khoroo')}>
                  <FieldStyle>Хороо</FieldStyle>
                </a>
              </li>
              <li>
                <a id="hospital" onClick={() => onClick('hospital')}>
                  <FieldStyle>Өрхийн эмнэлэг</FieldStyle>
                </a>
              </li>
              <li>
                <a id="busStop" onClick={() => onClick('busStop')}>
                  <FieldStyle>Автобусны буудал</FieldStyle>
                </a>
              </li>
            </SidebarList>
          </Box>
          <Box title={__('Орчны мэдээлэл')}>
            <SidebarList>
              <li>
                <a id="parking" onClick={() => onClick('parking')}>
                  <FieldStyle>Зогсоол</FieldStyle>
                </a>
              </li>
              <li>
                <a id="pharmacy" onClick={() => onClick('pharmacy')}>
                  <FieldStyle>Эмийн сан</FieldStyle>
                </a>
              </li>
            </SidebarList>
          </Box>
          <Box title={__('Дүүргийн байрны мэдээлэл')}>
            <SidebarList>
              <li>
                <a
                  id="districtTownData"
                  onClick={() => onClick('districtTown')}
                >
                  <FieldStyle>Дүүргийн байрны мэдээлэл</FieldStyle>
                </a>
              </li>
            </SidebarList>
          </Box>
        </Sidebar>
      </>
    );
  }

  render() {
    return <>{this.renderSidebar()}</>;
  }
}

export default withRouter(SidebarCategories);
