import { nanoid } from 'nanoid';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useFieldGroups, useFields } from 'ui-modules';
import { useProductsConfigs } from '@/products/settings/hooks/useProductsConfigs';
import { useProductsConfigsUpdate } from '@/products/settings/hooks/useProductsConfigsUpdate';
import { BASIC_PRODUCT_FILTER_FIELDS } from '@/products/settings/constants/basicProductFilterFields';
import type { IField } from 'ui-modules';

const SIMILARITY_GROUP_CODE = 'similarityGroup';

export interface SimilarityConfigRule {
  id?: string;
  title?: string;
  fieldGroupId?: string;
  fieldId?: string;
}

export interface SimilarityConfigGroup {
  groupKey: string;
  mask: string;
  title?: string;
  filterField?: string;
  defaultProduct?: string;
  rules?: SimilarityConfigRule[];
}

interface SimilarityConfigContextValue {
  similarityConfigGroups: SimilarityConfigGroup[];
  loading: boolean;
  updating: boolean;
  hasChanges: boolean;
  filterFieldOptions: { value: string; label: string }[];
  filterFieldOptionsByGroup: {
    basic: { value: string; label: string }[];
    custom: { value: string; label: string }[];
  };
  getFilterFieldLabel: (value: string) => string;
  fieldGroupsMap: Record<string, IField[]>;
  fieldGroupNames: Record<string, string>;
  openKeys: Record<string, boolean>;
  setOpenKey: (groupKey: string, open: boolean) => void;
  handleUpdateGroup: (
    groupKey: string,
    patch: Partial<Omit<SimilarityConfigGroup, 'groupKey'>>,
  ) => void;
  handleUpdateRule: (
    groupKey: string,
    ruleId: string,
    patch: Partial<SimilarityConfigRule>,
  ) => void;
  handleAddRule: (groupKey: string) => void;
  handleDeleteRule: (groupKey: string, ruleId: string) => void;
  handleDeleteGroup: (groupKey: string) => void | Promise<void>;
  handleSave: () => Promise<void>;
  handleAddGroup: () => void;
}

const SimilarityConfigContext =
  createContext<SimilarityConfigContextValue | null>(null);

function generateRuleId(): string {
  return nanoid();
}

function ensureRuleIds(rules: SimilarityConfigRule[]): SimilarityConfigRule[] {
  return rules.map((r) => (r.id ? r : { ...r, id: generateRuleId() }));
}

function parseRuleFromServer(r: Record<string, unknown>): SimilarityConfigRule {
  return {
    id: typeof r.id === 'string' ? r.id : undefined,
    title: typeof r.title === 'string' ? r.title : undefined,
    fieldGroupId: typeof r.groupId === 'string' ? r.groupId : undefined,
    fieldId: typeof r.fieldId === 'string' ? r.fieldId : undefined,
  };
}

function buildSimilarityConfigValue(
  groups: SimilarityConfigGroup[],
): Record<string, unknown> {
  const value: Record<string, unknown> = {};
  const serverKey = (g: SimilarityConfigGroup) =>
    g.title || g.mask || g.groupKey;
  for (const g of groups) {
    const key = serverKey(g);
    if (!key) continue;
    const rules = (g.rules ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      groupId: r.fieldGroupId,
      fieldId: r.fieldId,
    }));
    value[key] = {
      title: g.title ?? g.mask,
      codeMask: g.mask ?? g.title,
      filterField: g.filterField,
      defaultProduct: g.defaultProduct,
      rules,
    };
  }
  return value;
}

function parseSimilarityGroups(
  value: unknown,
): Record<string, Omit<SimilarityConfigGroup, 'groupKey'>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const raw = value as Record<string, unknown>;
  const result: Record<string, Omit<SimilarityConfigGroup, 'groupKey'>> = {};
  for (const key of Object.keys(raw)) {
    const item = raw[key];
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      const rules = Array.isArray(obj.rules)
        ? ensureRuleIds(
            (obj.rules as Record<string, unknown>[]).map(parseRuleFromServer),
          )
        : [];
      result[key] = {
        title: typeof obj.title === 'string' ? obj.title : key,
        mask: typeof obj.codeMask === 'string' ? obj.codeMask : '',
        filterField:
          typeof obj.filterField === 'string' ? obj.filterField : undefined,
        defaultProduct:
          typeof obj.defaultProduct === 'string'
            ? obj.defaultProduct
            : undefined,
        rules,
      };
    }
  }
  return result;
}

export function SimilarityConfigProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { configsMap, loading: configLoading } = useProductsConfigs();
  const { productsConfigsUpdate, loading: updating } =
    useProductsConfigsUpdate();
  const { fieldGroups, loading: fieldGroupsLoading } = useFieldGroups({
    contentType: 'core:product',
  });
  const { fields: allFields, loading: fieldsLoading } = useFields({
    contentType: 'core:product',
  });

  const [draft, setDraft] = useState<Record<string, Omit<SimilarityConfigGroup, 'groupKey'>>>({});
  const [deletedGroupKeys, setDeletedGroupKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [openKeys, setOpenKeysState] = useState<Record<string, boolean>>({});

  const saved = useMemo(
    () => parseSimilarityGroups(configsMap[SIMILARITY_GROUP_CODE]),
    [configsMap],
  );

  const similarityConfigGroups = useMemo((): SimilarityConfigGroup[] => {
    const merged = { ...saved, ...draft };
    return Object.entries(merged)
      .filter(([key]) => !deletedGroupKeys.has(key))
      .map(([key, g]) => ({
        ...g,
        groupKey: key,
        rules: ensureRuleIds(g.rules ?? []),
      }));
  }, [saved, draft, deletedGroupKeys]);

  const hasChanges = useMemo(() => {
    if (deletedGroupKeys.size > 0) return true;
    if (Object.keys(draft).length > 0) {
      return JSON.stringify(draft) !== JSON.stringify(saved);
    }
    return false;
  }, [saved, draft, deletedGroupKeys]);

  const fieldGroupsMap = useMemo((): Record<string, IField[]> => {
    const byGroup: Record<string, IField[]> = {};
    for (const g of fieldGroups) {
      byGroup[g._id] = [];
    }
    for (const f of allFields) {
      const gid = f.groupId ?? (f as IField & { group?: string }).group;
      if (gid && byGroup[gid]) {
        byGroup[gid].push(f);
      }
    }
    return byGroup;
  }, [fieldGroups, allFields]);

  const fieldGroupNames = useMemo(
    () => Object.fromEntries(fieldGroups.map((g) => [g._id, g.name])),
    [fieldGroups],
  );

  const { t } = useTranslation('product');

  const filterFieldOptionsByGroup = useMemo(() => {
    const basic = BASIC_PRODUCT_FILTER_FIELDS.map(({ value, labelKey }) => ({
      value,
      label: t(labelKey),
    }));
    const basicSet = new Set(basic.map((o) => o.value));
    const custom = allFields
      .filter((f) => !basicSet.has(f.code || f._id))
      .map((f) => ({
        value: f.code || f._id,
        label: f.name || f.code || f._id,
      }));
    return { basic, custom };
  }, [allFields, t]);

  const filterFieldOptions = useMemo(
    () => [
      ...filterFieldOptionsByGroup.basic,
      ...filterFieldOptionsByGroup.custom,
    ],
    [filterFieldOptionsByGroup],
  );

  const getFilterFieldLabel = useCallback(
    (value: string): string => {
      const found = filterFieldOptions.find((o) => o.value === value);
      return found ? found.label : value;
    },
    [filterFieldOptions],
  );

  const setOpenKey = useCallback((mask: string, open: boolean) => {
    setOpenKeysState((prev) => ({ ...prev, [mask]: open }));
  }, []);

  const handleUpdateGroup = useCallback(
    (
      groupKey: string,
      patch: Partial<Omit<SimilarityConfigGroup, 'groupKey'>>,
    ) => {
      setDraft((prev) => {
        const current = prev[groupKey] ?? saved[groupKey];
        return {
          ...prev,
          [groupKey]: {
            ...current,
            ...patch,
          },
        };
      });
    },
    [saved],
  );

  const handleUpdateRule = useCallback(
    (
      groupKey: string,
      ruleId: string,
      patch: Partial<SimilarityConfigRule>,
    ) => {
      setDraft((prev) => {
        const current = prev[groupKey] ?? saved[groupKey];
        const rules = (current?.rules ?? []).map((r) =>
          r.id === ruleId ? { ...r, ...patch } : r,
        );
        return {
          ...prev,
          [groupKey]: { ...current, rules },
        };
      });
    },
    [saved],
  );

  const handleAddRule = useCallback(
    (groupKey: string) => {
      setDraft((prev) => {
        const current = prev[groupKey] ?? saved[groupKey];
        const rules = [...(current?.rules ?? []), { id: generateRuleId() }];
        return {
          ...prev,
          [groupKey]: { ...current, rules },
        };
      });
    },
    [saved],
  );

  const handleDeleteRule = useCallback(
    (groupKey: string, ruleId: string) => {
      setDraft((prev) => {
        const current = prev[groupKey] ?? saved[groupKey];
        const rules = (current?.rules ?? []).filter((r) => r.id !== ruleId);
        return {
          ...prev,
          [groupKey]: { ...current, rules },
        };
      });
    },
    [saved],
  );

  const handleDeleteGroup = useCallback(
    async (groupKey: string) => {
      const isSavedGroup = saved[groupKey] !== undefined;
      const groupsWithoutDeleted = similarityConfigGroups.filter(
        (g) => g.groupKey !== groupKey,
      );

      setDraft((prev) => {
        const next = { ...prev };
        delete next[groupKey];
        return next;
      });
      setOpenKeysState((prev) => {
        const next = { ...prev };
        delete next[groupKey];
        return next;
      });
      if (isSavedGroup) {
        setDeletedGroupKeys((prev) => new Set(prev).add(groupKey));
      }

      if (isSavedGroup) {
        const value = buildSimilarityConfigValue(groupsWithoutDeleted);
        await productsConfigsUpdate({
          variables: {
            configsMap: { [SIMILARITY_GROUP_CODE]: value },
          },
        });
        setDraft({});
        setDeletedGroupKeys(new Set());
      }
    },
    [saved, similarityConfigGroups, productsConfigsUpdate],
  );

  const handleSave = useCallback(async () => {
    const value = buildSimilarityConfigValue(similarityConfigGroups);
    await productsConfigsUpdate({
      variables: {
        configsMap: { [SIMILARITY_GROUP_CODE]: value },
      },
    });
    setDraft({});
    setDeletedGroupKeys(new Set());
  }, [similarityConfigGroups, productsConfigsUpdate]);

  const handleAddGroup = useCallback(() => {
    const groupKey = nanoid();
    setDraft((prev) => ({
      ...prev,
      [groupKey]: { mask: '', title: '' },
    }));
    setOpenKeysState((prev) => ({ ...prev, [groupKey]: true }));
  }, []);

  const loading = configLoading || fieldGroupsLoading || fieldsLoading;

  return (
    <SimilarityConfigContext.Provider
      value={{
        similarityConfigGroups,
        loading,
        updating,
        hasChanges,
        filterFieldOptions,
        filterFieldOptionsByGroup,
        getFilterFieldLabel,
        fieldGroupsMap,
        fieldGroupNames,
        openKeys,
        setOpenKey,
        handleUpdateGroup,
        handleUpdateRule,
        handleAddRule,
        handleDeleteRule,
        handleDeleteGroup,
        handleSave,
        handleAddGroup,
      }}
    >
      {children}
    </SimilarityConfigContext.Provider>
  );
}

export function useSimilarityConfig(): SimilarityConfigContextValue {
  const ctx = useContext(SimilarityConfigContext);
  if (!ctx) {
    throw new Error(
      'useSimilarityConfig must be used within SimilarityConfigProvider',
    );
  }
  return ctx;
}
