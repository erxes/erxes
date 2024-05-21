import { useEffect, useRef } from "react";

function useOutsideClick(callback, excludedRefs = [] as any) {
  const ref = useRef() as any;

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        !excludedRefs.some((excludedRef) =>
          excludedRef.current.contains(event.target)
        )
      ) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback, excludedRefs]);
  console.log("here");
  return ref;
}

export default useOutsideClick;
