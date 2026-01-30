import { test, step, createExpect, ExpectWithMessage } from '../../framework/core/testContext';
import { DummyJsonClient } from '../../framework/api/DummyJsonClient';
import { readFileSync } from 'fs';


test.describe('DummyJSON Products API Positive Tests', () => {
    let client: DummyJsonClient;
    let expect: ExpectWithMessage;
  
    test.beforeEach(async ({ logger }) => {
      logger.info('Executing test setup');
      client = new DummyJsonClient(logger);
      expect = createExpect(logger);
      logger.info('Test setup completed');
    });

    test('TC01 – Happy Path - Create a new product', async ({ logger, testSteps }) => {
        const productData = JSON.parse(readFileSync('src/tests/testData/productData.json', 'utf8'));
        const oldProducts = await step(logger, testSteps, 'Call GET /products to get the current total of products', async () => {
            const res = await client.getProducts();
            return res;
        });
        const oldTotal = oldProducts!.total;
        const createResult = await step(logger, testSteps, 'Call POST /products to create a new product', async () => {
            const res = await client.createProduct(productData);
            logger.info(`Created product: ${JSON.stringify(res, null, 2)}`);
            return res;
        });
        const newProducts = await step(logger, testSteps, 'Call GET /products to get the new total of products', async () => {
            const res = await client.getProducts();
            return res;
        });
        const newTotal = newProducts!.total;
        await step(logger, testSteps, 'Validate the new product is created', async () => {
            // Commented out due to the creation endpoint not making real changes to the database
            // expect(newTotal, 'The new total of products should be one more than the old total').toBe(oldTotal + 1);
            expect(createResult!.id, 'The new product should have an id').toBeGreaterThan(0);
            expect(createResult!.title, 'The new product should have the correct title').toBe(productData.title);
            expect(createResult!.description, 'The new product should have the correct description').toBe(productData.description);
            expect(createResult!.category, 'The new product should have the correct category').toBe(productData.category);
        });
        //another step to validate the product update => update endpoint => verify response then verify with the getbyID endpoint
        // Commented out due to the deletion endpoint nor making real changes to the database
        // await step(logger, testSteps, 'Delete the new product', async () => {
        //     await client.deleteProduct(createResult!.id);
        // });
        // const deletedProducts = await step(logger, testSteps, 'Call GET /products to get the deleted total of products', async () => {
        //     const res = await client.getProducts();
        //     return res;
        // });
        // const deletedTotal = deletedProducts!.total;
        // await step(logger, testSteps, 'Validate the new product is deleted', async () => {
        //     expect(deletedTotal, 'The deleted total of products should be one less than the old total').toBe(oldTotal);
        // });
    });
});