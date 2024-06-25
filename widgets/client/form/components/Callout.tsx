import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { readFile } from '../../utils';
import { ICallout } from '../types';
import TopBar from './TopBar';
import { useAppContext } from '../../messenger/containers/AppContext';

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

const Callout: React.FC<Props> = ({
  configs = {},
  hasTopBar,
  onSubmit,
  setHeight,
  ...props
}) => {
  const { getColor } = useAppContext();

  // if lead is in a messenger, return messenger theme color (getColor())
  // else return lead theme color
  const color = getColor ? getColor() : props.color;

  const callOutRef = useRef<HTMLDivElement>(null);
  const [callOutWidth, setCallOutWidth] = useState(0);

  useEffect(() => {
    if (setHeight) {
      setHeight();
    }

    if (callOutRef.current) {
      const width = callOutRef.current.clientWidth;
      setCallOutWidth(width);
    }
  }, [setHeight]);

  const renderFeaturedImage = (
    image: string,
    title: string,
    calloutImgSize?: string
  ) => {
    if (!image) {
      return null;
    }

    const style = {
      width: calloutImgSize || '50%',
    };

    const imgWidth =
      callOutWidth *
      (calloutImgSize ? parseInt(calloutImgSize, 10) / 100 : 0.5);

    return (
      <img
        id="callOutImg"
        onLoad={setHeight}
        src={readFile(image, imgWidth * 1.5)}
        alt={title}
        style={style}
      />
    );
  };

  const renderHead = (title: string) => {
    if (hasTopBar) {
      return <TopBar title={title} color={color} />;
    }

    return <h4>{title}</h4>;
  };

  const {
    skip = false,
    title = '',
    buttonText = '',
    body = '',
    featuredImage = '',
    calloutImgSize = '50%',
  } = configs;

  if (skip) {
    return null;
  }

  return (
    <div className="erxes-form">
      {renderHead(title)}

      <div className="erxes-form-content">
        <div className="erxes-callout-body" ref={callOutRef}>
          {renderFeaturedImage(featuredImage, title, calloutImgSize)}
          {body}
        </div>
        <button
          style={{ background: color }}
          type="button"
          className="erxes-button btn-block"
          onClick={onSubmit}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Callout;
