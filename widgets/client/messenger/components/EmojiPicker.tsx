import * as React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { iconEmoji } from '../../icons/Icons';

type Props = {
  onEmojiSelect: (emoji: any) => void;
};
const EmojiPicker: React.FC<Props> = ({ onEmojiSelect }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const showPicker = () => {
    setIsVisible(true);
  };
  const hidePicker = () => {
    setIsVisible(false);
  };

  return (
    <div className="emoji-picker-wrapper">
      <button title="Choose an emoji" onClick={showPicker} type="button">
        {iconEmoji}
      </button>
      {isVisible ? (
        <Picker
          className="emoji-picker-container"
          data={data}
          onEmojiSelect={onEmojiSelect}
          theme="dark"
          onClickOutside={hidePicker}
        />
      ) : null}
    </div>
  );
};

export default EmojiPicker;
