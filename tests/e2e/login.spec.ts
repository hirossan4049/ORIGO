import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display the login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login to ORIGO' })).toBeVisible();

    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
