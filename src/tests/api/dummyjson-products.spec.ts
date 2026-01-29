import { test, step, createExpect, ExpectWithMessage } from '../../framework/core/testContext';
import { SamplePostsClient } from '../../framework/api/DummyJsonClient';
import { randomInt } from 'crypto';
import { readFileSync } from 'fs';

test.describe('DummyJSON Products API Positive Tests', () => {
  let client: SamplePostsClient;
  let expect: ExpectWithMessage;

  test.beforeEach(async ({ logger }) => {
    logger.info('Executing test setup');
    client = new SamplePostsClient(logger);
    expect = createExpect(logger);
    logger.info('Test setup completed');
  });

  test('TC01 – Get all products endpoint smoke test', async ({ logger, testSteps }) => {
    const result = await step(logger, testSteps, 'Call GET /products and validate the default settings', async () => {
      const res = await client.getProducts();

      expect(res.skip, 'Skip should be zero by default').toBe(0);
      expect(res.limit, 'Limit should be 30 by default').toBe(30);
      expect(res.products.length, 'The length of the products array should be equal to the limit').toBe(res.limit);

      return res;
    });

    await step(logger, testSteps, 'Validate first product basic structure', async () => {
      const first = result!.products[0];

      expect(first.id).toBeGreaterThan(0);
      expect(first.title?.trim().length).toBeGreaterThan(0);
      expect(first.price).toBeGreaterThan(0);
      expect(first.category?.trim().length).toBeGreaterThan(0);
      expect(first.rating).toBeGreaterThanOrEqual(0);
      expect(first.stock).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(first.tags)).toBeTruthy();
      expect(first.meta).toBeDefined();
      expect(first.meta?.createdAt).toBeTruthy();
      expect(first.meta?.updatedAt).toBeTruthy();
      expect(first.meta?.barcode).toBeTruthy();
      expect(first.meta?.qrCode).toBeTruthy();
      if (first.reviews && first.reviews.length > 0) {
        const review = first.reviews[0];
        expect(review.rating).toBeGreaterThanOrEqual(0);
        expect(review.comment.trim().length).toBeGreaterThan(0);
        expect(review.reviewerName.trim().length).toBeGreaterThan(0);
        expect(review.reviewerEmail).toContain('@');
      }
    });
  });

  test('TC02 – Products data integrity across endpoints', async ({ logger, testSteps }) => {
    const allProductsResult = await step(logger, testSteps, 'Fetch all products', async () => {
      return client.getProducts();
    });

    let id = allProductsResult!.products[randomInt(0, allProductsResult!.products.length - 1)]!.id;

    const productByIdResult = await step(logger, testSteps, 'Fetch product by ID', async () => {
      return client.getProductById(id!);
    });

    await step(logger, testSteps, 'Validate product data integrity between all products and product by ID endpoints', async () => {
      let allProductDataMatch = allProductsResult!.products.find(p => p.id === id);
      expect(productByIdResult!.id, 'Product ID should be the same as the ID fetched from all products').toBe(id);
      expect(productByIdResult!.title, 'Product title should be the same as the title fetched from all products').toBe(allProductDataMatch!.title);
      expect(productByIdResult!.price, 'Product price should be the same as the price fetched from all products').toBe(allProductDataMatch!.price);
      expect(productByIdResult!.category, 'Product category should be the same as the category fetched from all products').toBe(allProductDataMatch!.category);
      expect(productByIdResult!.rating, 'Product rating should be the same as the rating fetched from all products').toBe(allProductDataMatch!.rating);
      expect(productByIdResult!.stock, 'Product stock should be the same as the stock fetched from all products').toBe(allProductDataMatch!.stock);
      expect(productByIdResult!.tags, 'Product tags should be the same as the tags fetched from all products').toStrictEqual(allProductDataMatch!.tags);
      expect(productByIdResult!.meta, 'Product meta should be the same as the meta fetched from all products').toStrictEqual(allProductDataMatch!.meta);
    });
  });

  test('TC03 – Search products endpoint smoke test', async ({ logger, testSteps }) => {
    let searchTerm = 'phone';
    const result = await step(logger, testSteps, 'Call GET /products/search and validate the default settings', async () => {
      return client.searchProducts(searchTerm);
    });

    await step(logger, testSteps, 'Validate search products results contain the search term', async () => {
      expect(result!.products.length, 'The length of the products array should be greater than zero').toBeGreaterThan(0);
      expect(result!.products.every(p => p.description?.toLowerCase().includes(searchTerm.toLowerCase())), 'All products should contain the search term in the title').toBeTruthy();
    });
  });

  test('TC04 – Search products endpoint with limit and skip parameters', async ({ logger, testSteps }) => {
    let limit = 10;
    let skip = 5;
    let searchTerm = 'phone';
    const result = await step(logger, testSteps, 'Call GET /products/search with limit and skip parameters', async () => {
      return client.searchProducts(searchTerm, limit, skip);
    });
    const controlResult = await step(logger, testSteps, 'Call GET /products/search with 0 skip and greater limit to verify skipping', async () => {
      return client.searchProducts(searchTerm, 15, 0);
    });

    await step(logger, testSteps, 'Verify that the limited and skipped results are contained in the control result with correct offset', async () => {
      expect(result!.limit, 'The limit should be the same as the limit parameter').toBe(limit);
      expect(result!.skip, 'The skip should be the same as the skip parameter').toBe(skip);
      expect(result!.products.length, 'The length of the products array should be the same as the limit').toBe(limit);
      for (let i = 0; i < result!.products.length; i++) {
        expect(controlResult!.products[i + skip]).toStrictEqual(result!.products[i]);
      }
    });

  });

  test('TC05 – Get products by category endpoint smoke test', async ({ logger, testSteps }) => {
    const categories = await step(logger, testSteps, 'Call GET /products/category-list and get the list of categories', async () => {
      return client.getCategoriesList();
    });
    const category = categories![randomInt(0, categories!.length - 1)];
    const result = await step(logger, testSteps, 'Call GET /products/category and validate the default settings', async () => {
      return client.getProductsByCategory(category, 5, 0);
    });
    await step(logger, testSteps, 'Validate the products by category results contain the category', async () => {
      expect(result!.products.length <= 5, 'The length of the products array should be less than or equal to the limit').toBe(true);
      expect(result!.products.every(p => p.category.toLowerCase().includes(category.toLowerCase())), 'All products should contain the category in the title').toBeTruthy();
    });
  });

  test('TC06 – Get products categories endpoint smoke test', async ({ logger, testSteps }) => {
    const result = await step(logger, testSteps, 'Call GET /products/categories and validate the default settings', async () => {
      return client.getAllCategories();
    });
    await step(logger, testSteps, 'Validate the products categories results contain the categories', async () => {
      expect(result!.length, 'The length of the categories array should be greater than zero').toBeGreaterThan(0);
      result!.every(c => expect(c.slug! == c.name.toLowerCase()).toBe(true));
      expect(result!.every(c => c.url! == `https://dummyjson.com/products/category/${c.slug}`)).toBe(true);
    });
  });

  test('TC07 – Get products enpoint filtering and ordering', async ({ logger, testSteps }) => {
    const result = await step(logger, testSteps, 'Call GET /products with limit and skip parameters and limited the data by select parameter', async () => {
      return client.getProducts(10, 0, 'price', 'asc', 'id,title,price');
    });
    await step(logger, testSteps, 'Validate the products are ordered by price ascendingly', async () => {
      for (let i = 0; i < result!.products.length -1; i++) {
        expect(result!.products[i + 1].price, `Product ${i} price should be greater than or equal to product ${i + 1} price`).toBeGreaterThanOrEqual(result!.products[i].price!);
      }
    });

    await step(logger, testSteps, 'Validate the products consist of the selected fields', async () => {
      expect(result!.products.every(p => p.id != undefined)).toBe(true);
      expect(result!.products.every(p => p.title != undefined)).toBe(true);
      expect(result!.products.every(p => p.price != undefined)).toBe(true);
      expect(result!.products.every(p => p.category == undefined)).toBe(true);
    });
  });

  test('TC08 - create product endpoint smoke test', async ({ logger, testSteps }) => {
    const productData = JSON.parse(readFileSync('src/tests/testData/productData.json', 'utf8'));
    const result = await step(logger, testSteps, 'Call GET /products/add and get the product data', async () => {
      return client.createProduct(productData);
    });
    await step(logger, testSteps, 'Validate the product is created correctly', async () => {
      expect(result!.id, 'The product should have an id').toBeGreaterThan(0);
      expect(result!.title, 'The product should have the correct title').toBe(productData.title);
      expect(result!.description, 'The product should have the correct description').toBe(productData.description);
      expect(result!.category, 'The product should have the correct category').toBe(productData.category);
    });
  });

  test('TC09 - update product endpoint smoke test', async ({ logger, testSteps }) => {
    const productData = JSON.parse(readFileSync('src/tests/testData/productData.json', 'utf8'));
    const id = randomInt(1, 100);
    const result = await step(logger, testSteps, 'Call GET /products/update and get the product data', async () => {
      return client.updateProduct(id, productData);
    });
    await step(logger, testSteps, 'Validate the product is updated correctly', async () => {
      expect(result!.title, 'The product should have the correct title').toBe(productData.title);
      expect(result!.description, 'The product should have the correct description').toBe(productData.description);
      expect(result!.category, 'The product should have the correct category').toBe(productData.category);
    });
  });

  test('TC10 - delete product endpoint smoke test', async ({ logger, testSteps }) => {
    const id = randomInt(1, 100);
    const productToDelete = await step(logger, testSteps, 'Call GET /product/id and get the product data', async () => {
    return client.getProductById(id);
    });

    const result = await step(logger, testSteps, 'Call GET /products/delete and get the product data', async () => {
      return client.deleteProduct(id);
    });
    await step(logger, testSteps, 'Validate the product is deleted correctly', async () => {
      expect(result!.isDeleted, 'The product should be deleted').toBe(true);
      expect(result!.deletedOn, 'The product should have a deleted on date').toBeTruthy();
      expect(result!.title, 'The product should have the correct title').toBe(productToDelete!.title);
      expect(result!.description, 'The product should have the correct description').toBe(productToDelete!.description);
      expect(result!.category, 'The product should have the correct category').toBe(productToDelete!.category);
    });
  });
});
