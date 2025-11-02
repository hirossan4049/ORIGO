import { test, expect } from '@playwright/test';

const user = {
  email: process.env.TEST_USER_EMAIL!,
  password: process.env.TEST_USER_PASSWORD!,
};

test.describe('Simple Login Test', () => {
  test('should login and check session', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill in credentials
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);

    // Click login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait a bit for the request to complete
    await page.waitForTimeout(2000);

    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    // Check if we have an error message
    const errorMessage = page.locator('text=Invalid email or password');
    if (await errorMessage.isVisible()) {
      console.log('❌ Error message visible');
    } else {
      console.log('✅ No error message');
    }

    // Check if we're redirected to dashboard
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Redirected to dashboard');
    } else {
      console.log('❌ Not redirected to dashboard');
    }

    // Try to navigate to dashboard manually to see what happens
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    const finalUrl = page.url();
    console.log('Final URL after going to dashboard:', finalUrl);
  });
});