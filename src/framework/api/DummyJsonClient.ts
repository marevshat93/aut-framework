import { BaseApiClient } from './BaseApiClient';
import { Logger } from '../core/logger';

export interface Product {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    tags: string[];
    brand: string;
    sku: string;
    weight: number;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    warrantyInformation: string;
    shippingInformation: string;
    availabilityStatus: string;
    reviews: Review[];
    returnPolicy: string;
    minimumOrderQuantity: number;
    meta: {
        createdAt: string;
        updatedAt: string;
        barcode: string;
        qrCode: string;
    };
    thumbnail: string;
    images: string[];
}
export interface Review {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
}
export interface GetAllProductsResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
  }

export interface GetProductsResponse {
    products: Partial<Product>[];
    total: number;
    skip: number;
    limit: number;
  }

export interface Category {
    slug: string;
    name: string;
    url: string;
  }

  export interface deleteProductResponse {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    tags: string[];
    brand: string;
    sku: string;
    weight: number;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    warrantyInformation: string;
    shippingInformation: string;
    availabilityStatus: string;
    reviews: Review[];
    returnPolicy: string;
    minimumOrderQuantity: number;
    meta: {
        createdAt: string;
        updatedAt: string;
        barcode: string;
        qrCode: string;
    };
    thumbnail: string;
    images: string[];
    isDeleted: boolean;
    deletedOn: string;
  }

/**
 * Example API client extending the BaseApiClient.
 * Targets the JSONPlaceholder /posts resource.
 */
export class DummyJsonClient extends BaseApiClient {
  constructor(logger: Logger) {
    super('dummyJSON', logger);
  }

  async getProducts(limit?: number, skip?: number, sort?: string, order?: string, select?: string): Promise<GetProductsResponse> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (skip) params.set('skip', skip.toString());
    if (sort) params.set('sortBy', sort);
    if (order) params.set('order', order);
    if (select) params.set('select', select);
    return this.get<GetProductsResponse>(`/products?${params.toString()}`, { description: 'Get all products' });
  }

  async getProductById(id: number): Promise<Product> {
    return this.get<Product>(`/products/${id}`, { description: `Get product by id=${id}` });
  }

  async searchProducts(query: string, limit?: number, skip?: number, sort?: string, order?: string, select?: string): Promise<GetProductsResponse> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (skip) params.set('skip', skip.toString());
    if (sort) params.set('sortBy', sort);
    if (order) params.set('order', order);
    if (select) params.set('select', select);
    return this.get<GetProductsResponse>(`/products/search?q=${query}&${params.toString()}`, { description: `Search products by query=${query}` });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.get<Category[]>(`/products/categories`, { description: `Get all categories` });
  }

  async getCategoriesList(): Promise<string[]> {
    return this.get<string[]>(`products/category-list`, { description: `Get categories list` });
  }

  async getProductsByCategory(category: string, limit?: number, skip?: number): Promise<GetAllProductsResponse> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (skip) params.set('skip', skip.toString());
    return this.get<GetAllProductsResponse>(`/products/category/${category}?${params.toString()}`, { description: `Get products by category=${category}` });
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.post<Product>(`/products/add`, product, { headers: { 'Content-Type': 'application/json' },description: `Create product` });
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Partial<Product>> {
    return this.put<Partial<Product>>(`/products/${id}`, update, { headers: { 'Content-Type': 'application/json' },description: `Update product by id=${id}` });
  }

  async deleteProduct(id: number): Promise<deleteProductResponse> {
    return this.delete<deleteProductResponse>(`/products/${id}`, { description: `Delete product by id=${id}` });
  }
}

