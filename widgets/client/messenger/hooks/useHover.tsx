import * as React from 'react';

function useHover(): [(node: Node | null) => void, boolean] {
  const [isHovering, setIsHovering] = React.useState(false);
  const previousNode = React.useRef<HTMLInputElement | null>(null);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovering(false);
  }, []);

  const customRef = React.useCallback(
    (node: any) => {
      if (previousNode.current?.nodeType === Node.ELEMENT_NODE) {
        previousNode.current.removeEventListener(
          'mouseenter',
          handleMouseEnter
        );
        previousNode.current.removeEventListener(
          'mouseleave',
          handleMouseLeave
        );
      }

      if (node?.nodeType === Node.ELEMENT_NODE) {
        node.addEventListener('mouseenter', handleMouseEnter);
        node.addEventListener('mouseleave', handleMouseLeave);
      }

      previousNode.current = node;
    },
    [handleMouseEnter, handleMouseLeave]
  );

  return [customRef, isHovering];
}

export default useHover;
