import { TextOverflowTooltip } from 'erxes-ui';
import { useState } from 'react';

export const KbOverflowText = ({ value }: { value?: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isHovered) {
    return <TextOverflowTooltip value={value} />;
  }

  return (
    <span className="w-full truncate" onPointerEnter={() => setIsHovered(true)}>
      {value}
    </span>
  );
};
