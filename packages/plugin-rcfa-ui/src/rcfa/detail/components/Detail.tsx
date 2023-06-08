import React from 'react';
import { PageHeader, BarItems, Icon, colors, __ } from '@erxes/ui/src';
import {
  RoundButton,
  Container,
  TreeCard,
  ZoomActions,
  ZoomIcon,
  CustomColumn,
  CustomColumns
} from '../../../styles';
import { Column } from '@erxes/ui/src/styles/main';
import PortableCard from '../../../common/PortableCard';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
type Props = {
  detail: any;
};

type State = {
  issues: any[];
  isZoomable: boolean;
  zoomStep: number;
  zoom: number;
  percentage: number;
};

let instance;
const getColor = issue => {
  if (
    !issue?.relType &&
    !issue?.relTypeId &&
    !issue?.isRootCause &&
    issue?.status === 'closed'
  ) {
    return colors.colorCoreRed;
  }

  if (issue?.relType && issue?.relTypeId) {
    return colors.colorCoreYellow;
  }
  if (issue.isRootCause) {
    return colors.colorCoreGreen;
  }
  return colors.colorCoreBlue;
};

const connectionStyle = {
  stroke: '#456',
  strokeWidth: 2,
  endpoint: 'Blank',
  connector: ['Flowchart', { stub: 30, cornerRadius: 5 }]
};

class Detail extends React.Component<Props, State> {
  containerRef = React.createRef() as any;
  instanceRef = React.createRef() as any;
  private setZoom;
  constructor(props) {
    super(props);

    this.state = {
      issues: props?.detail?.issues || [],
      isZoomable: false,
      zoomStep: 0.025,
      zoom: 1,
      percentage: 100
    };
  }

  connectInstance = () => {
    const { detail } = this.props;
    const issues = detail?.issues || [];

    instance = jsPlumb.getInstance({
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      Container: 'canvas'
    });

    const connections = (issues || []).map(issue => ({
      source: issue.parentId,
      target: issue._id
    }));

    connections.forEach(connection => {
      instance.connect({
        id: Math.random(),
        ...connection,
        ...connectionStyle,
        anchor: ['Bottom', 'TopCenter']
      });
    });
    this.instanceRef.current = instance;
  };

  destroyJsPlumb = () => {
    if (this.instanceRef.current) {
      this.instanceRef.current.deleteEveryConnection();
      this.instanceRef.current.reset();
      this.instanceRef.current = null;
    }
  };
  handleResize = () => {
    this.destroyJsPlumb();
    this.connectInstance();
  };
  componentDidMount(): void {
    this.connectInstance();
  }

  componentDidUpdate(): void {
    this.setZoom = (zoom, instanceZoom, transformOrigin, el) => {
      transformOrigin = transformOrigin || [0.5, 0.5];
      instanceZoom = instanceZoom || jsPlumb;
      el = el || instanceZoom.getContainer();

      const p = ['webkit', 'moz', 'ms', 'o'];
      const s = 'scale(' + zoom + ')';
      const oString =
        transformOrigin[0] * 100 + '% ' + transformOrigin[1] * 100 + '%';

      for (let i = 0; i < p.length; i++) {
        el.style[p[i] + 'Transform'] = s;
        el.style[p[i] + 'TransformOrigin'] = oString;
      }

      el.style.transform = s;
      el.style.transformOrigin = oString;

      instanceZoom.setZoom(zoom);
      this.destroyJsPlumb();
      this.connectInstance();
    };
  }

  handleScroll = () => {
    this.destroyJsPlumb();
    this.connectInstance();
  };

  doZoom = (step: number, inRange: boolean) => {
    const { isZoomable, zoom } = this.state;

    if (inRange) {
      this.setState({ zoom: zoom + step });
      this.setZoom(zoom, jsPlumb, null, jquery('#canvas')[0]);

      if (isZoomable) {
        this.setState({ zoom: zoom + step });
        setTimeout(() => this.doZoom(step, inRange), 100);
      }
    }
  };

  onZoom = (type: string) => {
    const { zoomStep, zoom, percentage } = this.state;

    this.setState({ isZoomable: true }, () => {
      let step = 0 - zoomStep;
      const max = zoom <= 1;
      const min = zoom >= 0.399;

      if (type === 'zoomIn') {
        step = +zoomStep;

        this.doZoom(step, max);
        this.setState({ percentage: max ? percentage + 10 : 100 });
      }

      if (type === 'zoomOut') {
        this.doZoom(step, min);
        this.setState({ percentage: min ? percentage - 10 : 0 });
      }
    });
  };

  renderZoomActions() {
    return (
      <ZoomActions>
        <div className="icon-wrapper">
          <ZoomIcon
            disabled={this.state.zoom >= 1}
            onMouseDown={this.onZoom.bind(this, 'zoomIn')}
            onMouseUp={() => this.setState({ isZoomable: false })}
          >
            <Icon icon="plus" />
          </ZoomIcon>
          <ZoomIcon
            disabled={this.state.zoom <= 0.399}
            onMouseDown={this.onZoom.bind(this, 'zoomOut')}
            onMouseUp={() => this.setState({ isZoomable: false })}
          >
            <Icon icon="minus" />{' '}
          </ZoomIcon>
        </div>
        <span>{`${this.state.percentage}%`}</span>
      </ZoomActions>
    );
  }

  renderPortableCard(issue) {
    const { detail } = this.props;

    if (issue?.relType && issue?.relTypeId) {
      return (
        <div style={{ color: colors.colorCoreBlack }}>
          <PortableCard type={issue.relType} id={issue.relTypeId} />
        </div>
      );
    }

    if (issue.isRootCause && detail.relType && detail.relTypeId) {
      return (
        <div style={{ color: colors.colorCoreBlack }}>
          <PortableCard type={detail.relType} id={detail.relTypeId} />
        </div>
      );
    }
  }

  renderTree(issues) {
    return (
      <>
        <CustomColumns>
          {issues.map(issue => {
            return (
              <CustomColumn>
                <TreeCard id={issue._id} color={getColor(issue)}>
                  <div className="content">
                    <h5>{issue?.issue || ''}</h5>
                    <p>{issue?.description || ''}</p>
                  </div>
                  {this.renderPortableCard(issue)}
                </TreeCard>
                <Column>
                  {this.renderTree(
                    this.state.issues.filter(
                      item => issue._id === item.parentId
                    )
                  )}
                </Column>
              </CustomColumn>
            );
          })}
        </CustomColumns>
      </>
    );
  }

  renderContent() {
    const { detail } = this.props;
    const { issues } = detail || {};
    return (
      <Container ref={this.containerRef}>
        {this.renderZoomActions()}
        <div id="canvas" onScroll={this.handleScroll}>
          {this.renderTree((issues || []).filter(issue => !issue?.parentId))}
        </div>
      </Container>
    );
  }
  render() {
    const backBtn = () => {
      window.history.go(-1);
    };

    return (
      <>
        <PageHeader>
          <BarItems>
            <RoundButton onClick={backBtn}>
              <Icon icon="leftarrow-3" />
            </RoundButton>
            <h4>{__('RCFA Detail')}</h4>
          </BarItems>
        </PageHeader>
        {this.renderContent()}
      </>
    );
  }
}

export default Detail;
