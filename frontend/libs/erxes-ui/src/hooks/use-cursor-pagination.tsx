/* eslint-disable react-hooks/exhaustive-deps */
import { isUndefinedOrNull } from 'erxes-ui/utils';
import { useEffect, useRef, useState } from 'react';

export const useCursorScroll = ({
  dataLength,
  hasPreviousPage,
  offset = 102,
}: {
  dataLength?: number;
  hasPreviousPage?: boolean;
  offset?: number;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const distanceFromBottomRef = useRef(0);

  const [isFetchBackward, setIsFetchBackward] = useState(false);

  useEffect(() => {
    if (scrollRef.current && !isUndefinedOrNull(hasPreviousPage)) {
      scrollRef.current.scrollTop = hasPreviousPage ? offset : 0;
    }
  }, [hasPreviousPage]);

  useEffect(() => {
    if (scrollRef.current) {
      if (distanceFromBottomRef.current && isFetchBackward) {
        scrollRef.current.scrollTop =
          scrollRef.current.scrollHeight - distanceFromBottomRef.current;
        distanceFromBottomRef.current = 0;
        setIsFetchBackward(false);
      }
    }
  }, [dataLength]);

  return {
    scrollRef,
    isFetchBackward,
    setIsFetchBackward,
    distanceFromBottomRef,
  };
};
