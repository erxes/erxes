import React from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';

import { Button, Empty, Form, Input, Modal, Switch } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { getEnv } from 'apolloClient';
import Icon from 'modules/common/components/Icon';
import queryString from 'query-string';
import CopyToClipboard from 'react-copy-to-clipboard';
import 'react-grid-layout/css/styles.css';
import { isEmail, ReactMultiEmail } from 'react-multi-email';
import 'react-multi-email/style.css';
import 'react-resizable/css/styles.css';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IDashboardItem } from '../types';
import { ChartRenderer } from './ChartRenderer';
import DashboardItem from './DashboardItem';
import { Actions, EmptyWrapper, ShadowedHeader } from './styles';

const ReactGridLayout = WidthProvider(RGL);

const DragField = styledTS<any>(styled(ReactGridLayout))`
  margin: 20px;
  
  ${props =>
    props.isDragging &&
    `
      background: url('/static/images/drag-background.svg');
      background-repeat: repeat-y;
      background-position: 0px -4px;
      background-size: 100%;
  `};
`;

const deserializeItem = i => ({
  ...i,
  layout: JSON.parse(i.layout) || {},
  vizState: JSON.parse(i.vizState)
});

const defaultLayout = i => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || 4,
  h: i.layout.h || 8,
  minW: 3,
  minH: 3
});

type Props = {
  queryParams: any;
  dashboardItems: IDashboardItem[];
  dashboardId: string;
  editDashboardItem: (doc: { _id: string; layout: string }) => void;
  removeDashboardItem: (itemId: string) => void;
  sendEmail: (doc: {
    dashboardId: string;
    toEmails: string[];
    subject: string;
    content: string;
    sendUrl?: boolean;
  }) => void;
};

type State = {
  isDragging: boolean;
  visible: boolean;
  toEmails: string[];
  subject: string;
  content: string;
  copied: boolean;
  sendUrl: boolean;
};

const { REACT_APP_API_URL } = getEnv();
class Dashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isDragging: false,
      visible: false,
      toEmails: [],
      subject: '',
      content: '',
      copied: false,
      sendUrl: false
    };
  }

  setIsDragging = value => {
    this.setState({ isDragging: value });
  };

  onLayoutChange = newLayout => {
    const { dashboardItems, editDashboardItem } = this.props;

    newLayout.forEach(l => {
      const item = dashboardItems.find(i => i._id.toString() === l.i);
      const toUpdate = JSON.stringify({
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h
      });

      if (item && toUpdate !== item.layout) {
        editDashboardItem({
          _id: item._id,
          layout: toUpdate
        });
      }
    });
  };

  printDashboard = () => {
    const stringified = queryString.stringify({
      dashboardId: this.props.dashboardId
    });

    window.open(
      `${REACT_APP_API_URL}/print-dashboard?${stringified}`,
      '_blank'
    );
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  onSwitchChange = (checked: boolean) => {
    this.setState({ sendUrl: checked });
  };

  setTitleModalVisible = value => {
    this.setState({
      visible: value
    });
  };

  handleSubmit = () => {
    const { dashboardId, sendEmail } = this.props;
    const { subject, toEmails, content, sendUrl } = this.state;
    this.setState({ visible: false });

    return sendEmail({
      dashboardId,
      subject,
      toEmails,
      content,
      sendUrl
    });
  };

  render() {
    const {
      dashboardItems,
      dashboardId,
      removeDashboardItem,
      queryParams
    } = this.props;
    const { visible, toEmails } = this.state;
    const onCopy = () => this.setState({ copied: true });

    if (dashboardItems.length === 0) {
      return (
        <EmptyWrapper>
          <Empty
            image="/images/empty.svg"
            imageStyle={{
              height: 200
            }}
            description="There are no charts"
          />
        </EmptyWrapper>
      );
    }

    const dashboardItem = item => {
      if (item.layout) {
        const height = item.layout.h * 40;

        return (
          <div key={item._id} data-grid={defaultLayout(item)}>
            <DashboardItem
              key={item._id}
              itemId={item._id}
              dashboardId={dashboardId}
              title={item.name}
              removeDashboardItem={removeDashboardItem}
            >
              <ChartRenderer
                chartType={item.vizState.chartType}
                chartHeight={height}
                query={item.vizState.query}
              />
            </DashboardItem>
          </div>
        );
      }
      return;
    };

    const onChange = (e, type) =>
      this.onChange(type, (e.currentTarget as HTMLInputElement).value);

    const validateEmail = email => {
      return isEmail(email);
    };

    return (
      <>
        {queryParams && queryParams.public === 'true' ? null : (
          <ShadowedHeader>
            <Actions>
              <CopyToClipboard text={`${window.location.href}?public=true`}>
                <Button
                  type={this.state.copied ? 'primary' : 'default'}
                  shape="round"
                  onClick={onCopy}
                  icon={<Icon icon="copy-1" />}
                >
                  {this.state.copied ? 'Copied' : 'Copy Dashboard public url'}
                </Button>
              </CopyToClipboard>

              <Button
                onClick={this.printDashboard}
                shape="round"
                icon={<Icon icon="pdf" />}
              >
                Download as PDF
              </Button>
              <Button
                shape="round"
                onClick={() => this.setTitleModalVisible(true)}
                icon={<Icon icon="envelope-upload" />}
              >
                Email this Dashboard
              </Button>
            </Actions>
          </ShadowedHeader>
        )}

        <Modal
          key="modal"
          title="Email this Dashboard"
          visible={visible}
          onOk={async () => {
            this.handleSubmit();
          }}
          okText="Send"
          okButtonProps={{ shape: 'round', icon: <Icon icon="check-circle" /> }}
          cancelButtonProps={{
            shape: 'round',
            icon: <Icon icon="times-circle" />
          }}
          onCancel={() => this.setTitleModalVisible(false)}
        >
          <Form layout="vertical">
            <Form.Item label="Recipents">
              <ReactMultiEmail
                placeholder="Recipents"
                emails={toEmails}
                onChange={(email: string[]) => {
                  this.setState({ toEmails: email });
                }}
                validateEmail={email => validateEmail(email)}
                getLabel={(
                  email: string,
                  index: number,
                  removeEmail: (index: number) => void
                ) => {
                  return (
                    <div data-tag={true} key={index}>
                      {email}
                      <span
                        data-tag-handle={true}
                        onClick={() => removeEmail(index)}
                      >
                        load ×
                      </span>
                    </div>
                  );
                }}
              />
            </Form.Item>
            <Form.Item label="Email Subject">
              <Input
                placeholder="Email Subject"
                onChange={e => onChange(e, 'subject')}
              />
            </Form.Item>
            <Form.Item label="Message">
              <TextArea
                placeholder="Message"
                onChange={e => onChange(e, 'content')}
              />
            </Form.Item>
            <Form.Item label="Include Shareable link">
              <Switch onChange={this.onSwitchChange} />
            </Form.Item>
          </Form>
        </Modal>

        <DragField
          margin={[20, 20]}
          containerPadding={[0, 0]}
          onDragStart={() => this.setIsDragging(true)}
          onDragStop={() => this.setIsDragging(false)}
          onResizeStart={() => this.setIsDragging(true)}
          onResizeStop={() => this.setIsDragging(false)}
          cols={24}
          rowHeight={40}
          onLayoutChange={this.onLayoutChange}
          isDragging={this.state.isDragging}
        >
          {dashboardItems.map(deserializeItem).map(dashboardItem)}
        </DragField>
      </>
    );
  }
}

export default Dashboard;
