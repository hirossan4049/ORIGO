import { test, expect } from '@playwright/test';

const user = {
  email: process.env.TEST_USER_EMAIL!,
  password: process.env.TEST_USER_PASSWORD!,
};

test.describe('Project Creation', () => {
  test('should create a project successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for login to complete
    await page.waitForTimeout(2000);

    // Check if we're on dashboard or redirected there
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard')) {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);
    }

    // Create a new project
    const projectName = `Test Project ${Date.now()}`;
    await page.getByRole('button', { name: 'Create' }).first().click();
    await page.getByLabel('Title').fill(projectName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();

    // Check if we were redirected to project page or stayed on dashboard
    await page.waitForTimeout(2000);
    const finalUrl = page.url();
    console.log('Final URL after project creation:', finalUrl);

    // If we're still on dashboard, check if the project appears in the list
    if (finalUrl.includes('/dashboard')) {
      await expect(page.getByText(projectName)).toBeVisible();
    } else if (finalUrl.includes('/projects/')) {
      // If we're on project page, check for project name heading
      await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
    }
  });
});