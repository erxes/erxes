import type { TProductRemainderProvider } from 'erxes-ui';
import {
  MONGOLIAN_ERKHET_PRODUCT_REMAINDERS,
  MONGOLIAN_PRODUCT_REMAINDER_CONFIG,
} from './graphql/queries/productRemainderQueries';

type MongolianRemainderConfigData = {
  mnConfig?: {
    _id: string;
    value?: unknown;
  } | null;
};

type MongolianErkhetRemainder = {
  _id: string;
  remainder?: number | null;
  remainders?: unknown[] | null;
};

type MongolianErkhetRemainderData = {
  erkhetRemainders?: MongolianErkhetRemainder[] | null;
};

const hasRemainderConfig = (value: unknown) => {
  if (!value) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return typeof value === 'object';
};

export const mongolianProductRemainderProvider: TProductRemainderProvider =
  async ({ products, pipelineId, query }) => {
    if (!pipelineId || !products.length) {
      return [];
    }

    const configResponse = await query<
      MongolianRemainderConfigData,
      { pipelineId: string }
    >({
      query: MONGOLIAN_PRODUCT_REMAINDER_CONFIG,
      variables: { pipelineId },
      fetchPolicy: 'cache-first',
    });

    if (!hasRemainderConfig(configResponse.data.mnConfig?.value)) {
      return [];
    }

    const remainderResponse = await query<
      MongolianErkhetRemainderData,
      { productIds: string[]; pipelineId: string }
    >({
      query: MONGOLIAN_ERKHET_PRODUCT_REMAINDERS,
      variables: {
        productIds: products.map((product) => product._id),
        pipelineId,
      },
      fetchPolicy: 'network-only',
    });

    return (remainderResponse.data.erkhetRemainders || []).map((remainder) => ({
      _id: remainder._id,
      remainder: {
        remainder: remainder.remainder ?? 0,
        remainders: remainder.remainders ?? [],
      },
    }));
  };
