import { Children, cloneElement, isValidElement } from 'react';
import { PlaceholderInputHeader } from '../components/placeholderInput/PlaceholderInputHeader';

export const usePlaceHolderInputChildren = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: 'fixed' | 'expression';
}) => {
  let headerElement: React.ReactElement | null = null;
  const otherChildren: React.ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === PlaceholderInputHeader ||
        (child.type as any)?.displayName === 'PlaceholderInput.Header')
    ) {
      if (variant) {
        return;
      }
      headerElement = cloneElement(child, {
        ...(child.props || {}),
      });
    } else {
      otherChildren.push(child);
    }
  });

  return {
    headerElement,
    otherChildren,
  };
};
