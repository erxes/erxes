import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { LayoutPage, PageTemplate } from '../types';
import { pagesAtom } from '../states/builderStates';
import { id } from '../utils/id';
import {
  StorageQuotaError,
  writePages,
} from '../utils/storage';
import { uniqueSlug } from '../utils/slug';
import {
  buildEmptyRoot,
  buildHeadingRoot,
  buildLandingRoot,
  buildStatsRoot,
} from '../utils/seed';
import { cloneWithNewIds } from '../utils/tree';

const newRootForTemplate = (template: PageTemplate) => {
  switch (template) {
    case 'landing':
      return buildLandingRoot();
    case 'with-header':
      return buildHeadingRoot();
    case 'with-sidebar':
      return buildStatsRoot();
    case 'blank':
    default:
      return buildEmptyRoot();
  }
};

export const usePages = () => {
  const [pages, setPages] = useAtom(pagesAtom);

  const persist = useCallback(
    (next: LayoutPage[]) => {
      try {
        writePages(next);
        setPages(next);
        return { ok: true as const };
      } catch (err) {
        if (err instanceof StorageQuotaError) {
          return { ok: false as const, error: err.message };
        }
        throw err;
      }
    },
    [setPages],
  );

  const create = useCallback(
    (input: { title: string; slug?: string; template: PageTemplate }) => {
      const now = new Date().toISOString();
      const finalSlug = uniqueSlug(
        input.slug || input.title,
        pages.map((p) => p.slug),
      );
      const page: LayoutPage = {
        id: id(),
        title: input.title.trim() || 'Untitled',
        slug: finalSlug,
        status: 'draft',
        template: input.template,
        root: newRootForTemplate(input.template),
        createdAt: now,
        updatedAt: now,
      };
      const result = persist([page, ...pages]);
      return { ...result, page };
    },
    [pages, persist],
  );

  const update = useCallback(
    (page: LayoutPage) => {
      const next = pages.map((p) =>
        p.id === page.id
          ? { ...page, updatedAt: new Date().toISOString() }
          : p,
      );
      return persist(next);
    },
    [pages, persist],
  );

  const remove = useCallback(
    (pageId: string) => persist(pages.filter((p) => p.id !== pageId)),
    [pages, persist],
  );

  const duplicate = useCallback(
    (pageId: string) => {
      const source = pages.find((p) => p.id === pageId);
      if (!source) return { ok: false as const };
      const now = new Date().toISOString();
      const duplicated: LayoutPage = {
        ...source,
        id: id(),
        title: `${source.title} (copy)`,
        slug: uniqueSlug(
          `${source.slug}-copy`,
          pages.map((p) => p.slug),
        ),
        status: 'draft',
        root: cloneWithNewIds(source.root, id),
        createdAt: now,
        updatedAt: now,
      };
      const result = persist([duplicated, ...pages]);
      return { ...result, page: duplicated };
    },
    [pages, persist],
  );

  const get = useCallback(
    (pageId: string) => pages.find((p) => p.id === pageId) ?? null,
    [pages],
  );

  const getBySlug = useCallback(
    (slug: string) => pages.find((p) => p.slug === slug) ?? null,
    [pages],
  );

  const slugTaken = useCallback(
    (slug: string, exceptId?: string) =>
      pages.some((p) => p.slug === slug && p.id !== exceptId),
    [pages],
  );

  return useMemo(
    () => ({
      pages,
      get,
      getBySlug,
      create,
      update,
      remove,
      duplicate,
      slugTaken,
    }),
    [pages, get, getBySlug, create, update, remove, duplicate, slugTaken],
  );
};
