

export const PRODUCT_TEMPLATE_OMIT_FIELDS = [
    '_id', 
    'tagIds', 
    'customFieldsData', 
    'propertiesData', 
    'attachment', 
    'attachmentMore', 
    'pdfAttachment', 
    'vendorId', 
    'mergedIds',
    'createdAt',
    'updatedAt',
];

export const productTemplateHandler = {
    getContent: async (data: any, ctx: any) => {
        const { contentId, contentIds } = data;
        const { models } = ctx;

        const query = { _id: contentId };

        if (contentIds?.length) {
            query._id = { $in: contentIds };
        }

        const projection: Record<string, 0> = {}

        for (const field of PRODUCT_TEMPLATE_OMIT_FIELDS) {
            projection[field] = 0;
        }

        const products = await models.Products.find(query, projection).lean();

        return JSON.stringify(products);
    },
    useTemplate: async (data: any, ctx: any) => {
        const { template, user } = data;
        const { models } = ctx;

        const { contentType, content, relatedContents } = template;

        if (contentType === 'core:products') {
        const product = await models.Products.createProduct({
            ...JSON.parse(content),
            code: '234fsscds',
        });

        return `/settings/products/?product_id=${product._id}`;
        }
    }
}