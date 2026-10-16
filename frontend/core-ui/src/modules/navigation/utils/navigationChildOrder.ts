export const getNavigationChildOrder = (
  storedPaths: string[] | undefined,
  path: string,
) => {
  if (!storedPaths?.length) {
    return undefined;
  }

  const index = storedPaths.indexOf(path);

  return (index === -1 ? storedPaths.length : index) + 1;
};

export const getVisualNavigationChildPaths = (item: Element | null) => {
  const siblings = Array.from(item?.parentElement?.children ?? []).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && Boolean(element.dataset.navPath),
  );

  return siblings
    .map((element, index) => ({
      index,
      order: Number.parseInt(getComputedStyle(element).order, 10) || 0,
      path: element.dataset.navPath as string,
    }))
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map(({ path }) => path);
};
