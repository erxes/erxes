import { zodResolver } from '@hookform/resolvers/zod';
import { IconMapSearch } from '@tabler/icons-react';
import { Button, Form, Input, Select } from 'erxes-ui';
import { LatLngLiteral } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  findAddressAt,
  usePapaAddressSearch,
} from '../hooks/usePapaAddressSearch';
import { usePapaReferences } from '../hooks/usePapaReferences';
import {
  IOrderDeliveryDefaults,
  matchPapaDistrict,
  PAPA_SIZES,
  TPapaDelivery,
} from '../utils/papaJson';
import { PapaLocationMap } from './PapaLocationMap';
import { PapaReferenceSelect } from './PapaReferenceSelect';

const toPosition = (lat: string, lng: string): LatLngLiteral | null => {
  const latitude = Number(lat);
  const longitude = Number(lng);

  return lat.trim() !== '' &&
    lng.trim() !== '' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
    ? { lat: latitude, lng: longitude }
    : null;
};

const coordinate = (limit: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value !== '' &&
        Number.isFinite(Number(value)) &&
        Math.abs(Number(value)) <= limit,
      'Invalid coordinate',
    );

const quoteSchema = z.object({
  toLocationId: z.string().min(1, 'Required'),
  toAddress: z.string().trim().min(1, 'Required').max(500),
  toLatitude: coordinate(90),
  toLongitude: coordinate(180),
  size: z.enum(PAPA_SIZES),
});

export type TPapaQuoteForm = z.infer<typeof quoteSchema>;

interface PapaDeliveryQuoteFormProps {
  defaults: IOrderDeliveryDefaults;
  previous: TPapaDelivery | null;
  busy: boolean;
  onSubmit: (values: TPapaQuoteForm) => Promise<boolean>;
}

/** Step 1: confirm the customer's district and pin, then ask Papa for a price. */
export const PapaDeliveryQuoteForm = ({
  defaults,
  previous,
  busy,
  onSubmit,
}: PapaDeliveryQuoteFormProps) => {
  const { t } = useTranslation('sales');
  const { references, loading } = usePapaReferences();
  // The address the map last filled in; typed text is never overwritten.
  const mapAddress = useRef<string | null>(null);
  const lookupId = useRef(0);
  const previousSize = PAPA_SIZES.find((size) => size === previous?.size);

  const form = useForm<TPapaQuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      toLocationId: previous?.toLocationId || '',
      toAddress: previous?.toAddress || defaults.address,
      toLatitude: String(previous?.toLatitude ?? defaults.lat ?? ''),
      toLongitude: String(previous?.toLongitude ?? defaults.lng ?? ''),
      size: previousSize || 'SMALL',
    },
  });

  const latitude = form.watch('toLatitude');
  const longitude = form.watch('toLongitude');
  const position = useMemo(
    () => toPosition(latitude, longitude),
    [latitude, longitude],
  );

  // Six decimals is about 10 cm, more than a delivery pin needs.
  const setPosition = useCallback(
    (place: LatLngLiteral) => {
      const options = { shouldDirty: true, shouldValidate: true };
      form.setValue('toLatitude', place.lat.toFixed(6), options);
      form.setValue('toLongitude', place.lng.toFixed(6), options);
    },
    [form],
  );

  const { search, searching } = usePapaAddressSearch(setPosition);

  // A map pick fills an empty (or map-filled) address with what
  // OpenStreetMap knows there: one request per click or drag, as Nominatim
  // requires; a slower answer for an older pick is ignored.
  const pickOnMap = useCallback(
    async (place: LatLngLiteral) => {
      setPosition(place);

      const current = form.getValues('toAddress').trim();

      if (current && current !== mapAddress.current) {
        return;
      }

      const id = ++lookupId.current;
      const address = await findAddressAt(place).catch(
        () => null,
      );

      if (!address || id !== lookupId.current) {
        return;
      }

      if (form.getValues('toAddress').trim() !== current) {
        return;
      }

      mapAddress.current = address;
      form.setValue('toAddress', address, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form, setPosition],
  );

  // Pre-select the checkout's district once Papa's locations have loaded.
  useEffect(() => {
    if (form.getValues('toLocationId') || !references.locations.length) {
      return;
    }

    const locationId = matchPapaDistrict(
      defaults.district,
      references.locations,
    );

    if (locationId) {
      form.setValue('toLocationId', locationId);
    }
  }, [defaults.district, form, references.locations]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
        noValidate
      >
        <Form.Field
          control={form.control}
          name="toLocationId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('papa-district', 'District')}</Form.Label>
              <PapaReferenceSelect
                rows={references.locations}
                nested
                value={field.value}
                onChange={field.onChange}
                loading={loading}
                placeholder={t('papa-choose-district', 'Choose a district')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="toAddress"
          render={({ field }) => (
            <Form.Item>
              <div className="flex items-center justify-between gap-2">
                <Form.Label>
                  {t('papa-delivery-address', 'Delivery address')}
                </Form.Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={searching || !field.value?.trim()}
                  onClick={() => search(field.value)}
                >
                  <IconMapSearch />
                  {t('papa-find-on-map', 'Find on map')}
                </Button>
              </div>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="space-y-1">
          <PapaLocationMap
            position={position}
            onChange={(place) => {
              void pickOnMap(place);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t(
              'papa-map-hint',
              'Click the delivery spot or drag the pin; the coordinates follow it, and an empty address is filled from the map.',
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Form.Field
            control={form.control}
            name="toLatitude"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('papa-latitude', 'Latitude')}</Form.Label>
                <Form.Control>
                  <Input {...field} inputMode="decimal" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="toLongitude"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('papa-longitude', 'Longitude')}</Form.Label>
                <Form.Control>
                  <Input {...field} inputMode="decimal" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Form.Field
          control={form.control}
          name="size"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('papa-size', 'Package size')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {PAPA_SIZES.map((size) => (
                    <Select.Item key={size} value={size}>
                      {t(`papa-size-${size.toLowerCase()}`, size)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" disabled={busy} className="w-full">
          {t('papa-get-price', 'Get delivery price')}
        </Button>
      </form>
    </Form>
  );
};
