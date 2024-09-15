import * as React from 'react';
import { readFile } from '../../utils';
import { ICallout } from '../types';
import TopBar from './TopBar';
import { getColor } from '../../messenger/utils/util';

type Props = {
  onSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
  setHeight?: () => void;
  configs: ICallout;
  color: string;
  hasTopBar?: boolean;
};

type State = {
  callOutWidth: number;
};

class Callout extends React.Component<Props, State> {
  private callOutRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.callOutRef = React.createRef();
    this.state = {
      callOutWidth: 0,
    };
  }

  componentDidMount() {
    if (this.props.setHeight) {
      this.props.setHeight();
    }

    // calculate width of component
    if (this.callOutRef.current) {
      const width = this.callOutRef.current.clientWidth;
      this.setState({ callOutWidth: width });
    }
  }

  renderFeaturedImage(image: string, title: string, calloutImgSize?: string) {
    if (!image) {
      return null;
    }

    const style = {
      width: calloutImgSize || '50%',
    };

    const imgWidth =
      this.state.callOutWidth *
      (calloutImgSize ? parseInt(calloutImgSize, 10) / 100 : 0.5);

    return (
      <img
        id={'callOutImg'}
        onLoad={this.props.setHeight}
        src={readFile(image, imgWidth * 1.5)}
        alt={title}
        style={style}
      />
    );
  }

  renderHead(title: string) {
    const { hasTopBar, color } = this.props;
    if (hasTopBar) {
      return <TopBar title={title} color={color} />;
    }

    return <h4>{title}</h4>;
  }

  render() {
    const { configs, onSubmit, color } = this.props;
    const defaultConfig = {
      skip: false,
      title: '',
      buttonText: '',
      body: '',
      featuredImage: '',
      calloutImgSize: '50%',
    };
    const {
      skip,
      title = '',
      buttonText,
      body,
      featuredImage = '',
      calloutImgSize = '50%',
    } = configs || defaultConfig;

    if (skip) {
      return null;
    }

    return (
      <div className='erxes-form'>
        {this.renderHead(title)}

        <div className='erxes-form-content'>
          <div className='erxes-callout-body' ref={this.callOutRef}>
            {this.renderFeaturedImage(featuredImage, title, calloutImgSize)}
            {body}
          </div>
          <button
            style={{ background: color }}
            type='button'
            className='erxes-button btn-block'
            onClick={onSubmit}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  }
}

export default (props: Props) => {
  return (
    <Callout
      {...props}
      // if lead is in a messenger, return messenger theme color (getColor())
      // else return lead theme color
      color={props.color ? props.color : getColor()}
    />
  );
};
