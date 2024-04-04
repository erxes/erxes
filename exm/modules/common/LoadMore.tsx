import Button from './Button';
import { IRouterProps } from '../types';
import React from 'react';
import { useRouter } from 'next/router';

interface IProps extends IRouterProps {
  perPage?: number;
  all: number;
  paramName?: string;
  loading?: boolean;
}

function LoadMore({ perPage = 20, all, paramName = 'limit', loading }: IProps) {
  const router = useRouter();
  const prevNumber = Number(router && router.query?.limit) || 20;

  const load = () => {
    // Set query parameters and navigate to a new URL
    router.push({
      pathname: '/',
      query: { limit: prevNumber + perPage }
    });
  };

  return prevNumber < all ? (
    <Button
      block={true}
      btnStyle="link"
      onClick={load}
      icon="redo"
      uppercase={false}
    >
      {loading ? 'Loading...' : 'Load more'}
    </Button>
  ) : null;
}

export default LoadMore;
