import { test, expect } from '@playwright/test';

const user = {
  email: process.env.TEST_USER_EMAIL!,
  password: process.env.TEST_USER_PASSWORD!,
};

test.describe('Project and File Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');
  });

  test('should allow a user to create a project, create a file, edit it, and set a schedule', async ({ page }) => {
    // Create a new project
    const projectName = `My Test Project - ${Date.now()}`;
    await page.getByRole('button', { name: 'Create' }).first().click();
    await page.getByLabel('Title').fill(projectName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();

    // Wait for navigation to project page
    await page.waitForURL(/\/projects\/\d+/);
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    // Create a new file
    const fileName = `my-test-file.js`;
    await page.getByRole('button', { name: 'Create New File' }).click();
    await page.getByLabel('File Name').fill(fileName);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('heading', { name: fileName })).toBeVisible();

    // Edit the file
    const fileContent = `console.log("Hello from ${fileName}");`;
    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(fileContent);
    await page.getByRole('button', { name: 'Save File' }).click();
    await expect(page.getByText('File saved successfully')).toBeVisible();

    // Set a schedule
    await page.getByRole('button', { name: 'Create Schedule' }).click();
    await page.getByLabel('Function Name').fill('main');
    await page.getByRole('button', { name: 'Create Schedule' }).click();
    await expect(page.getByText('Schedule created successfully')).toBeVisible();
    await expect(page.getByText('Cron: */5 * * * *')).toBeVisible();
  });
});
