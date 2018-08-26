import { Model, model } from "mongoose";
import { Deals } from ".";
import { IProductDocument, productSchema } from "./definitions/deals";

interface IProductInput {
  name: string;
  type?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
}

interface IProductModel extends Model<IProductDocument> {
  createProduct(doc: IProductInput): Promise<IProductDocument>;
  updateProduct(_id: string, doc: IProductInput): Promise<IProductDocument>;
  removeProduct(_id: string): void;
}

class Product {
  /**
   * Create a product
   */
  public static async createProduct(doc: IProductInput) {
    return Products.create(doc);
  }

  /**
   * Update Product
   */
  public static async updateProduct(_id: string, doc: IProductInput) {
    await Products.update({ _id }, { $set: doc });

    return Products.findOne({ _id });
  }

  /**
   * Remove Product
   */
  public static async removeProduct(_id: string) {
    const product = await Products.findOne({ _id });

    if (!product) {
      throw new Error("Product not found");
    }

    const count = await Deals.find({
      "productsData.productId": { $in: [_id] }
    }).count();

    if (count > 0) {
      throw new Error("Can't remove a product");
    }

    return Products.remove({ _id });
  }
}

productSchema.loadClass(Product);

const Products = model<IProductDocument, IProductModel>(
  "products",
  productSchema
);

export default Products;
