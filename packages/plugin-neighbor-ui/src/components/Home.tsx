import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import List from '../components/List';
import SidebarCategories from './SideBarCategory';
import queryString from 'query-string';
import Form from '../containers/Form';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

type Props = {
  type: string;
  data: any;
  refetch: () => void;
};

type State = {};

class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  renderGategory() {
    return <SidebarCategories></SidebarCategories>;
  }
  renderAdd() {
    const { type, data, refetch } = this.props;
    let typeTitle;
    switch (type) {
      case 'kindergarden':
        typeTitle = 'Цэцэрлэг';
        break;
      case 'school':
        typeTitle = 'Сургууль';
        break;
      case 'university':
        typeTitle = 'Их дээд сургууль';
        break;
      case 'soh':
        typeTitle = 'СӨХ';
        break;
      case 'khoroo':
        typeTitle = 'Хороо';
        break;
      case 'hospital':
        typeTitle = 'Өрхийн эмнэлэг';
        break;
      case 'busStop':
        typeTitle = 'Автобусны буудал';
        break;
      case 'parking':
        typeTitle = 'Зогсоол';
        break;
      case 'pharmacy':
        typeTitle = 'Эмийн сан';
        break;
      case 'districtTown':
        typeTitle = 'Дүүргийн байрны мэдээлэл';
        break;
    }
    const trigger = (
      <Button
        btnStyle="success"
        type="button"
        icon="plus-circle"
        uppercase={false}
      >
        Add
      </Button>
    );
    const content = formProps => {
      return (
        <React.Fragment>
          <Form type={type} refetch={refetch} {...formProps} />
        </React.Fragment>
      );
    };

    return (
      <ModalTrigger
        title={typeTitle}
        autoOpenKey="showKBAddModal"
        trigger={trigger}
        content={content}
        enforceFocus={false}
      />
    );
  }

  render() {
    const { type, data, refetch } = this.props;
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Neighbor')}
            breadcrumb={[
              { title: __('Settings'), link: '/settings' },
              { title: __('Neighbor') }
            ]}
          />
        }
        content={<List type={type} data={data} refetch={refetch} />}
        leftSidebar={this.renderGategory()}
        actionBar={<Wrapper.ActionBar right={this.renderAdd()} wideSpacing />}
        hasBorder
      ></Wrapper>
    );
  }
}
export default Home;
