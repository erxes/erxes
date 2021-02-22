import * as React from 'react';
import RTG from 'react-transition-group';
import { PipelineConsumer } from '../../containers/PipelineContext';
import { Label, LabelList } from '../../styles/label';
import { IPipelineLabel } from '../../types';

type IProps = {
  labels: IPipelineLabel[];
  indicator?: boolean;
};

class Labels extends React.PureComponent<IProps, { isHover: boolean }> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      isHover: false
    };
  }

  hover = (isHover: boolean) => {
    this.setState({ isHover });
  };

  hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) || [];
    const increaseValue = 0.9;

    return {
      r: parseInt(result[1], 16) * increaseValue,
      g: parseInt(result[2], 16) * increaseValue,
      b: parseInt(result[3], 16) * increaseValue
    };
  };

  renderContent(
    label: IPipelineLabel,
    isShowLabel: boolean,
    toggleLabels: () => void
  ) {
    const { indicator } = this.props;
    const { isHover } = this.state;
    const timeout = 300;

    if (indicator) {
      let colorCode = label.colorCode;

      if (isHover) {
        const rgb = this.hexToRgb(colorCode);
        colorCode = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
      }

      return (
        <Label
          key={label._id}
          color={colorCode}
          timeout={timeout}
          onClick={toggleLabels}
        >
          <RTG.CSSTransition
            in={isShowLabel}
            appear={isShowLabel}
            timeout={timeout}
            classNames="erxes-label"
          >
            <span>{label.name}</span>
          </RTG.CSSTransition>
        </Label>
      );
    }

    return (
      <Label key={label._id} color={label.colorCode}>
        {label.name}
      </Label>
    );
  }

  render() {
    const { labels } = this.props;

    if (!labels || labels.length === 0) {
      return null;
    }

    return (
      <PipelineConsumer>
        {({ isShowLabel, toggleLabels }) => {
          return (
            <LabelList
              onMouseEnter={this.hover.bind(null, true)}
              onMouseLeave={this.hover.bind(null, false)}
            >
              {labels.map(label =>
                this.renderContent(label, isShowLabel, toggleLabels)
              )}
            </LabelList>
          );
        }}
      </PipelineConsumer>
    );
  }
}

export default Labels;
