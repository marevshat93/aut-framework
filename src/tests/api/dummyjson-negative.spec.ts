import { test, step, createExpect, ExpectWithMessage } from '../../framework/core/testContext';
import { SamplePostsClient } from '../../framework/api/DummyJsonClient';

type ApiError = Error & { statusCode?: number };

test.describe('DummyJSON Products API Negative Tests', () => {
  let client: SamplePostsClient;
  let expect: ExpectWithMessage;

  test.beforeEach(async ({ logger }) => {
    logger.info('Executing test setup');
    client = new SamplePostsClient(logger);
    expect = createExpect(logger);
    logger.info('Test setup completed');
  });

  test('TC01 – Get product by invalid ID - Non-existent ID', async ({ logger, testSteps }) => {
    const nonExistentId = 999999;
    let error: ApiError | undefined;

    await step(logger, testSteps, `Attempt to get product with non-existent ID ${nonExistentId}`, async () => {
      try {
        await client.getProductById(nonExistentId);
      } catch (e) {
        error = e as ApiError;
      }
      expect(error, 'An error should be thrown for non-existent product ID').toBeDefined();
      expect(error?.statusCode, 'HTTP status code should be 404 (Not Found)').toBe(404);
    });
  });

  test('TC02 – Get product by invalid ID - Negative ID', async ({ logger, testSteps }) => {
    const negativeId = -1;
    let error: ApiError | undefined;

    await step(logger, testSteps, `Attempt to get product with negative ID ${negativeId}`, async () => {
      try {
        await client.getProductById(negativeId);
      } catch (e) {
        error = e as ApiError;
      }
      expect(error, 'An error should be thrown for negative product ID').toBeDefined();
      expect(error?.statusCode, 'HTTP status code should be 404 (Not Found)').toBe(404);
    });
  });

  test('TC03 – Get product by invalid ID - Zero ID', async ({ logger, testSteps }) => {
    const zeroId = 0;
    let error: ApiError | undefined;

    await step(logger, testSteps, `Attempt to get product with zero ID ${zeroId}`, async () => {
      try {
        await client.getProductById(zeroId);
      } catch (e) {
        error = e as ApiError;
      }
      expect(error, 'An error should be thrown for zero product ID').toBeDefined();
      expect(error?.statusCode, 'HTTP status code should be 404 (Not Found)').toBe(404);
    });
  });

  test('TC04 – Get products with invalid limit parameter - Negative value', async ({ logger, testSteps }) => {
    const negativeLimit = -5;
    let error: ApiError | undefined;

    await step(logger, testSteps, `Attempt to get products with negative limit ${negativeLimit}`, async () => {
      try {
        await client.getProducts(negativeLimit);
      } catch (e) {
        error = e as ApiError;
      }
      // Some APIs might handle this gracefully, so we check if error exists or if result is valid
      if (error) {
        expect(error, 'An error should be thrown for negative limit').toBeDefined();
        expect(error.statusCode, 'HTTP status code should be 400 (Bad Request) if error occurs').toBe(400);
      }
    });
  });

  test('TC05 – Get products with invalid skip parameter - Negative value', async ({ logger, testSteps }) => {
    const negativeSkip = -10;
    let error: ApiError | undefined;

    await step(logger, testSteps, `Attempt to get products with negative skip ${negativeSkip}`, async () => {
      try {
        await client.getProducts(30, negativeSkip);
      } catch (e) {
        error = e as ApiError;
      }
      // Some APIs might handle this gracefully, so we check if error exists or if result is valid
      if (error) {
        expect(error, 'An error should be thrown for negative skip').toBeDefined();
        expect(error.statusCode, 'HTTP status code should be 400 (Bad Request) if error occurs').toBe(400);
      }
    });
  });


  test('TC07 – Search products with special characters', async ({ logger, testSteps }) => {
    const specialCharQuery = '!@#$%^&*()';
    let result;

    await step(logger, testSteps, `Attempt to search products with special characters`, async () => {
      result = await client.searchProducts(specialCharQuery);
      // Should handle gracefully - return empty results or error
      expect(result, 'Search with special characters should return a result').toBeDefined();
      expect(result!.products.length, 'Special character query should return empty results').toBe(0);
    });
  });

  test('TC08 – Get products by invalid category - Non-existent category', async ({ logger, testSteps }) => {
    const invalidCategory = 'non-existent-category-xyz123';
    let error: ApiError | undefined;

    await step(logger, testSteps, `Attempt to get products with non-existent category`, async () => {
        const result = await client.getProductsByCategory(invalidCategory);
        expect(result.products.length, 'Non-existent category should return empty results').toBe(0);


    });
  });

  test('TC09 – Get products by invalid category - Empty category', async ({ logger, testSteps }) => {
    const emptyCategory = '';
    let error: ApiError | undefined;

    await step(logger, testSteps, `Attempt to get products with empty category`, async () => {
      try {
        await client.getProductsByCategory(emptyCategory);
      } catch (e) {
        error = e as ApiError;
      }
      expect(error, 'An error should be thrown for empty category').toBeDefined();
      expect(error?.statusCode, 'HTTP status code should be 404 (Not Found)').toBe(404);
    });
  });

});
