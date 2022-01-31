// useContextMenu.js
import { useEffect, useCallback, useState } from 'react';

type Props = {
  elementId?: string;
  show?: boolean;
};

const useContextMenu = (props: Props) => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);

  const handleContextMenu = useCallback(
    event => {
      if (props.show) {
        event.preventDefault();
        setAnchorPoint({ x: event.pageX, y: event.pageY });
        setShow(true);
      } else {
        setShow(false);
      }
    },
    [setShow, props.show, setAnchorPoint]
  );

  const handleClick = useCallback(() => (show ? setShow(false) : null), [show]);

  const root = document.getElementById('root');

  let element = root;

  if (props.elementId) {
    element = document.getElementById(props.elementId);
  }

  useEffect(() => {
    if (element) {
      element.addEventListener('click', handleClick);
      element.addEventListener('contextmenu', handleContextMenu);

      return () => {
        if (element) {
          element.removeEventListener('click', handleClick);
          element.removeEventListener('contextmenu', handleContextMenu);
        }
      };
    }

    return;
  });

  return { anchorPoint, show };
};

export default useContextMenu;
