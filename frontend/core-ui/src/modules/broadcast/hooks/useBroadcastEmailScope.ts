import { useMultiQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { BROADCAST_METHODS } from '../constants';

/**
 * Whether the list is narrowed to email.
 *
 * Only an email campaign is sent from a brand and from somebody, so those two
 * columns and their filters are shown only here. Anywhere else they would be
 * a column of dashes and a filter that narrows by something the rows do not
 * have.
 */
export const useBroadcastEmailScope = () => {
  const [{ methods, brand, fromUser }, setQueries] = useMultiQueryState<{
    methods: string;
    brand: string;
    fromUser: string;
  }>(['methods', 'brand', 'fromUser']);

  const isEmailScope = methods === BROADCAST_METHODS.EMAIL;

  // Left behind when the method changes, either filter would go on narrowing
  // a list that no longer offers a way to see or clear it.
  useEffect(() => {
    if (!isEmailScope && (brand || fromUser)) {
      setQueries({ brand: null, fromUser: null });
    }
  }, [isEmailScope, brand, fromUser, setQueries]);

  return isEmailScope;
};
