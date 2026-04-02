import { useState } from 'react';
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconX,
  IconCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import {
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
} from '~/modules/insurance/hooks';
import type { InsuranceRegion } from '~/modules/insurance/types';

export const RegionsPage = () => {
  const { regions, loading } = useRegions();
  const { createRegion } = useCreateRegion();
  const { updateRegion } = useUpdateRegion();
  const { deleteRegion } = useDeleteRegion();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [countriesInput, setCountriesInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newCountry, setNewCountry] = useState('');
  const [editCountriesId, setEditCountriesId] = useState<string | null>(null);

  // Check if a country exists in another region
  const findCountryRegion = (country: string, excludeRegionId?: string) => {
    return regions.find(
      (r: InsuranceRegion) =>
        r.id !== excludeRegionId &&
        r.countries.some(
          (c: string) => c.toLowerCase() === country.toLowerCase(),
        ),
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const countries = countriesInput
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean);

    // Check for conflicts
    for (const country of countries) {
      const existing = findCountryRegion(country);
      if (existing) {
        const confirmed = window.confirm(
          `"${country}" нь "${existing.name}" бүс нутагт аль хэдийн бүртгэлтэй байна. Хуучин бүс нутгаас хасаад шинэ бүс нутагт нэмэх үү?`,
        );
        if (!confirmed) return;
      }
    }

    await createRegion({ variables: { name, countries } });
    setName('');
    setCountriesInput('');
    setShowCreateForm(false);
  };

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return;
    const countries = countriesInput
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean);

    for (const country of countries) {
      const existing = findCountryRegion(country, id);
      if (existing) {
        const confirmed = window.confirm(
          `"${country}" нь "${existing.name}" бүс нутагт аль хэдийн бүртгэлтэй байна. Хуучин бүс нутгаас хасаад энд нэмэх үү?`,
        );
        if (!confirmed) return;
      }
    }

    await updateRegion({ variables: { id, name, countries } });
    setEditingId(null);
    setName('');
    setCountriesInput('');
  };

  const handleDelete = async (id: string) => {
    await deleteRegion({ variables: { id } });
    setDeleteConfirmId(null);
  };

  const startEdit = (region: InsuranceRegion) => {
    setEditingId(region.id);
    setName(region.name);
    setCountriesInput(region.countries.join(', '));
    setShowCreateForm(false);
  };

  const handleAddCountry = async (regionId: string) => {
    if (!newCountry.trim()) return;
    const country = newCountry.trim();

    const existing = findCountryRegion(country, regionId);
    if (existing) {
      const confirmed = window.confirm(
        `"${country}" нь "${existing.name}" бүс нутагт аль хэдийн бүртгэлтэй байна. Хуучин бүс нутгаас хасаад энд нэмэх үү?`,
      );
      if (!confirmed) return;
    }

    const region = regions.find((r: InsuranceRegion) => r.id === regionId);
    if (region) {
      await updateRegion({
        variables: {
          id: regionId,
          countries: [...region.countries, country],
        },
      });
    }
    setNewCountry('');
  };

  const handleRemoveCountry = async (
    regionId: string,
    country: string,
  ) => {
    const confirmed = window.confirm(
      `"${country}"-г энэ бүс нутгаас хасах уу?`,
    );
    if (!confirmed) return;

    const region = regions.find((r: InsuranceRegion) => r.id === regionId);
    if (region) {
      await updateRegion({
        variables: {
          id: regionId,
          countries: region.countries.filter((c: string) => c !== country),
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Бүс нутгууд (Regions)</h1>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingId(null);
            setName('');
            setCountriesInput('');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <IconPlus size={18} />
          Бүс нутаг нэмэх
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold mb-3">Шинэ бүс нутаг</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Бүс нутгийн нэр (жишээ: Asia, Schengen)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Улсууд (таслалаар тусгаарлах: Japan, China, Korea)"
              value={countriesInput}
              onChange={(e) => setCountriesInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <IconCheck size={16} />
                Хадгалах
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <IconX size={16} />
                Цуцлах
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {regions.map((region: InsuranceRegion) => (
          <div
            key={region.id}
            className="p-4 border rounded-lg bg-white shadow-sm"
          >
            {editingId === region.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  value={countriesInput}
                  onChange={(e) => setCountriesInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(region.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm"
                  >
                    <IconCheck size={14} />
                    Хадгалах
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                  >
                    <IconX size={14} />
                    Цуцлах
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{region.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditCountriesId(
                          editCountriesId === region.id ? null : region.id,
                        )
                      }
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Улс нэмэх/хасах"
                    >
                      <IconPlus size={16} />
                    </button>
                    <button
                      onClick={() => startEdit(region)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <IconEdit size={16} />
                    </button>
                    {deleteConfirmId === region.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(region.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                        >
                          Устгах
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-xs bg-gray-200 rounded"
                        >
                          Үгүй
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(region.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {region.countries.map((country: string) => (
                    <span
                      key={country}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {country}
                      {editCountriesId === region.id && (
                        <button
                          onClick={() =>
                            handleRemoveCountry(region.id, country)
                          }
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <IconX size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                  {region.countries.length === 0 && (
                    <span className="text-sm text-gray-400">
                      Улс бүртгэгдээгүй
                    </span>
                  )}
                </div>

                {editCountriesId === region.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Улсын нэр"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter')
                          handleAddCountry(region.id);
                      }}
                      className="px-3 py-1.5 border rounded-lg text-sm flex-1"
                    />
                    <button
                      onClick={() => handleAddCountry(region.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Нэмэх
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {regions.length === 0 && !showCreateForm && (
          <div className="text-center py-12 text-gray-500">
            <IconAlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
            <p>Бүс нутаг бүртгэгдээгүй байна</p>
          </div>
        )}
      </div>
    </div>
  );
};
