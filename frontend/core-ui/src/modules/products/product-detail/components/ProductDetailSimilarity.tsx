import { Badge, Empty, InfoCard, Table, cn } from 'erxes-ui';
import { IconLayoutGrid, IconStarFilled } from '@tabler/icons-react';
import { useFields } from 'ui-modules';
import {
  ProductSimilarity,
  ProductSimilarityProduct,
} from '@/products/product-detail/types/detailTypes';

interface ProductDetailSimilarityProps {
  similarity?: ProductSimilarity | null;
  productId?: string;
}

export const ProductDetailSimilarity = ({
  similarity,
  productId,
}: ProductDetailSimilarityProps) => {
  const { fields } = useFields({ contentType: 'core:product' });

  const fieldName = (fieldId: string) =>
    fields.find((f) => f._id === fieldId)?.name || fieldId;

  const labelOf = (fieldId: string, value?: string) =>
    (value &&
      fields
        .find((f) => f._id === fieldId)
        ?.options?.find((o) => o.value === value)?.label) ||
    value ||
    '';

  if (!similarity) {
    return (
      <Empty className="my-8">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconLayoutGrid />
          </Empty.Media>
          <Empty.Title>Not part of a similarity group</Empty.Title>
          <Empty.Description>
            This product isn’t linked to a similarity group. Create one from
            Product settings → Similarity to manage variants together.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  const {
    propertiesData = {},
    starProductId,
    products = [],
  } = similarity;

  const fieldIds = Object.keys(propertiesData);

  return (
    <div className="flex flex-col gap-4">
      <InfoCard title="Property fields">
        <InfoCard.Content>
          <div className="flex flex-col gap-3">
            {fieldIds.length === 0 ? (
              <div className="flex justify-center items-center px-4 py-6 text-sm rounded-lg border border-dashed text-muted-foreground">
                No fields added.
              </div>
            ) : (
              fieldIds.map((fieldId) => (
                <div
                  key={fieldId}
                  className="flex gap-3 items-center p-2 rounded-lg bg-foreground/5"
                >
                  <div className="w-32 shrink-0">
                    <div
                      className="text-sm font-medium truncate"
                      title={fieldName(fieldId)}
                    >
                      {fieldName(fieldId)}
                    </div>
                  </div>
                  <div className="flex flex-wrap flex-auto gap-1">
                    {(propertiesData[fieldId] || []).map((value) => (
                      <Badge key={value} variant="default">
                        {labelOf(fieldId, value)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title={`Products (${products.length})`}>
        <InfoCard.Content>
          <div className="overflow-auto max-h-[28rem] rounded-lg border">
            <Table>
              <Table.Header className="sticky top-0 z-10 bg-sidebar">
                <Table.Row>
                  <Table.Head className="px-3 w-auto">Code</Table.Head>
                  <Table.Head className="px-3 w-32">Unit price</Table.Head>
                  {fieldIds.map((fieldId) => (
                    <Table.Head key={fieldId} className="px-3 w-36">
                      {fieldName(fieldId)}
                    </Table.Head>
                  ))}
                  <Table.Head className="px-3 w-16 text-center">Star</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {products.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    fieldIds={fieldIds}
                    labelOf={labelOf}
                    isCurrent={product._id === productId}
                    isStar={product._id === starProductId}
                  />
                ))}
              </Table.Body>
            </Table>
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};

const ProductRow = ({
  product,
  fieldIds,
  labelOf,
  isCurrent,
  isStar,
}: {
  product: ProductSimilarityProduct;
  fieldIds: string[];
  labelOf: (fieldId: string, value?: string) => string;
  isCurrent: boolean;
  isStar: boolean;
}) => (
  <Table.Row className={cn(isCurrent && '[&>td]:bg-muted')}>
    <Table.Cell className="px-3 font-mono">{product.code}</Table.Cell>
    <Table.Cell className="px-3 text-right">
      {product.unitPrice ?? '-'}
    </Table.Cell>
    {fieldIds.map((fieldId) => (
      <Table.Cell key={fieldId} className="px-3">
        <Badge variant="secondary">
          {labelOf(fieldId, product.propertiesData?.[fieldId]?.[0]) || '-'}
        </Badge>
      </Table.Cell>
    ))}
    <Table.Cell className="px-3 text-center">
      {isStar && (
        <IconStarFilled size={14} className="inline text-warning" />
      )}
    </Table.Cell>
  </Table.Row>
);
