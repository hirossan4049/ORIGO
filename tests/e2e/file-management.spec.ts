import { test, expect } from '@playwright/test';

const user = {
  email: process.env.TEST_USER_EMAIL!,
  password: process.env.TEST_USER_PASSWORD!,
};

test.describe('File Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for login to complete
    await page.waitForTimeout(2000);

    // Check if we're on dashboard or redirect there
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard')) {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate to files page', async ({ page }) => {
    await page.goto('/files');

    await expect(page.getByRole('heading', { name: 'Files' })).toBeVisible();
    await expect(page.getByText('Manage your files across all projects')).toBeVisible();
  });

  test('should display file list with project information', async ({ page }) => {
    await page.goto('/files');

    const fileCards = page.locator('[data-testid="file-card"]');
    const fileCount = await fileCards.count();

    if (fileCount > 0) {
      const firstFile = fileCards.first();
      await expect(firstFile.getByText(/\.js$|\.ts$|\.py$/)).toBeVisible();
      await expect(firstFile.getByText(/Project:/)).toBeVisible();

      const editButton = firstFile.getByRole('button', { name: 'Edit' });
      if (await editButton.isVisible()) {
        await editButton.click();
        await expect(page.locator('.monaco-editor')).toBeVisible();
      }
    }
  });

  test('should handle file operations within a project', async ({ page }) => {
    const projectName = `Test Project ${Date.now()}`;
    const fileName = `test-file-${Date.now()}.js`;

    await page.getByRole('button', { name: 'Create' }).first().click();
    await page.getByLabel('Title').fill(projectName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: 'Create New File' }).click();
    await page.getByLabel('File Name').fill(fileName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('heading', { name: fileName })).toBeVisible();

    // Wait for file page to load
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: fileName })).toBeVisible();

    // Save the file without editing (it has default content)
    await page.getByRole('button', { name: 'Save File' }).click();
    await expect(page.getByText('File saved successfully')).toBeVisible();

    // Execute the file
    await page.getByRole('button', { name: 'Execute Now' }).click();
    // Wait for execution result to appear (the result is shown as JSON in a pre element)
    await expect(page.locator('pre').first()).toBeVisible({ timeout: 10000 });
  });

  test('should create and manage file schedules', async ({ page }) => {
    const projectName = `Schedule Test ${Date.now()}`;
    const fileName = `scheduled-file-${Date.now()}.js`;

    await page.getByRole('button', { name: 'Create' }).first().click();
    await page.getByLabel('Title').fill(projectName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: 'Create New File' }).click();
    await page.getByLabel('File Name').fill(fileName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();

    // Wait for file page to load
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: fileName })).toBeVisible();

    // Save the file without editing (it has default content with main function)
    await page.getByRole('button', { name: 'Save File' }).click();
    await expect(page.getByText('File saved successfully')).toBeVisible();

    await page.getByRole('button', { name: 'Create Schedule' }).click();
    await page.getByLabel('Function Name').fill('main');
    await page.locator('form').getByRole('button', { name: 'Create Schedule' }).click();

    await expect(page.getByText('Schedule created successfully')).toBeVisible();
    await expect(page.getByText('Cron: */5 * * * *')).toBeVisible();
  });

  test('should handle file deletion and project cleanup', async ({ page }) => {
    const projectName = `Cleanup Test ${Date.now()}`;

    await page.getByRole('button', { name: 'Create' }).first().click();
    await page.getByLabel('Title').fill(projectName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(3000);

    const deleteButton = page.getByRole('button', { name: 'Delete Project' });
    if (await deleteButton.isVisible()) {
      // Handle browser's native confirm dialog
      page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('confirm');
        await dialog.accept();
      });
      await deleteButton.click();
      await page.waitForURL('/dashboard');
    }
  });
});