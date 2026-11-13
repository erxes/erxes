import { useSearchParams } from 'react-router-dom';

const PARAM = 'product';

/** `?product=new` opens an empty product. */
const NEW = 'new';

/** The product sheet's state lives in the address (`?product=<id>`), so a link opens a product. */
export const useProductSheet = () => {
  const [params, setParams] = useSearchParams();
  const value = params.get(PARAM);

  const set = (next: string | null) =>
    setParams((previous) => {
      const updated = new URLSearchParams(previous);

      if (next) updated.set(PARAM, next);
      else updated.delete(PARAM);

      return updated;
    });

  return {
    open: value !== null,
    /** The open product's id; null for a new one or when closed. */
    productId: value && value !== NEW ? value : null,
    openProduct: (id: string) => set(id),
    openNew: () => set(NEW),
    close: () => set(null),
  };
};
