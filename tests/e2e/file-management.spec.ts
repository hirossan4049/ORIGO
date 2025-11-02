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
    await page.waitForURL('/dashboard');
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
    await page.waitForURL(/\/projects\/\d+/);

    await page.getByRole('button', { name: 'Create New File' }).click();
    await page.getByLabel('File Name').fill(fileName);
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('heading', { name: fileName })).toBeVisible();
    await expect(page.locator('.monaco-editor')).toBeVisible();

    const testCode = `function hello() {\n  console.log("Hello, World!");\n  return "success";\n}`;
    await page.locator('.monaco-editor').click();
    await page.keyboard.type(testCode);

    await page.getByRole('button', { name: 'Save File' }).click();
    await expect(page.getByText('File saved successfully')).toBeVisible();

    await page.getByRole('button', { name: 'Execute' }).click();
    await expect(page.getByText('Function executed successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should create and manage file schedules', async ({ page }) => {
    const projectName = `Schedule Test ${Date.now()}`;
    const fileName = `scheduled-file-${Date.now()}.js`;

    await page.getByRole('button', { name: 'Create' }).first().click();
    await page.getByLabel('Title').fill(projectName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();
    await page.waitForURL(/\/projects\/\d+/);

    await page.getByRole('button', { name: 'Create New File' }).click();
    await page.getByLabel('File Name').fill(fileName);
    await page.getByRole('button', { name: 'Create' }).click();

    const scheduleCode = `function main() {\n  console.log("Scheduled execution");\n  return { status: "completed", timestamp: new Date() };\n}`;
    await page.locator('.monaco-editor').click();
    await page.keyboard.type(scheduleCode);
    await page.getByRole('button', { name: 'Save File' }).click();

    await page.getByRole('button', { name: 'Create Schedule' }).click();
    await page.getByLabel('Function Name').fill('main');
    await page.getByRole('button', { name: 'Create Schedule' }).click();

    await expect(page.getByText('Schedule created successfully')).toBeVisible();
    await expect(page.getByText('Cron: */5 * * * *')).toBeVisible();
  });

  test('should handle file deletion and project cleanup', async ({ page }) => {
    const projectName = `Cleanup Test ${Date.now()}`;

    await page.getByRole('button', { name: 'Create' }).first().click();
    await page.getByLabel('Title').fill(projectName);
    await page.locator('form').getByRole('button', { name: 'Create' }).click();
    await page.waitForURL(/\/projects\/\d+/);

    const deleteButton = page.getByRole('button', { name: 'Delete Project' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await expect(page.getByText('Project deleted successfully')).toBeVisible();
      await page.waitForURL('/dashboard');
    }
  });
});