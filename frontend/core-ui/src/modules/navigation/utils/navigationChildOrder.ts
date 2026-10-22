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

/**
 * A menu item added after the user reordered keeps its default spot (right
 * after its default predecessor) instead of piling up below the saved ones.
 */
export const mergeNavigationChildOrder = (
  storedPaths: string[],
  defaultPaths: string[],
) => {
  const merged = [...storedPaths];

  defaultPaths.forEach((path, index) => {
    if (merged.includes(path)) {
      return;
    }

    const previous = defaultPaths
      .slice(0, index)
      .reverse()
      .find((candidate) => merged.includes(candidate));

    merged.splice(previous ? merged.indexOf(previous) + 1 : 0, 0, path);
  });

  return merged;
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
