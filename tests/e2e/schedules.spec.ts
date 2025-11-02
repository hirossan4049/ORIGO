import { test, expect } from '@playwright/test';

const user = {
  email: process.env.TEST_USER_EMAIL!,
  password: process.env.TEST_USER_PASSWORD!,
};

test.describe('Schedules Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');
  });

  test('should display schedules page with existing schedules', async ({ page }) => {
    await page.goto('/schedules');

    await expect(page.getByRole('heading', { name: 'Schedules' })).toBeVisible();
    await expect(page.getByText('Manage your scheduled executions')).toBeVisible();
  });

  test('should show schedule details and allow execution', async ({ page }) => {
    await page.goto('/schedules');

    const scheduleCard = page.locator('[data-testid="schedule-card"]').first();
    if (await scheduleCard.isVisible()) {
      await expect(scheduleCard.getByText(/Project:/)).toBeVisible();
      await expect(scheduleCard.getByText(/File:/)).toBeVisible();
      await expect(scheduleCard.getByText(/Function:/)).toBeVisible();
      await expect(scheduleCard.getByText(/Cron:/)).toBeVisible();

      const executeButton = scheduleCard.getByRole('button', { name: 'Execute Now' });
      if (await executeButton.isVisible()) {
        await executeButton.click();
        await expect(page.getByText(/executed/i)).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should handle empty schedules state', async ({ page }) => {
    await page.goto('/schedules');

    const noSchedulesMessage = page.getByText('No schedules found');
    const scheduleCards = page.locator('[data-testid="schedule-card"]');

    const hasSchedules = await scheduleCards.count() > 0;

    if (!hasSchedules) {
      await expect(noSchedulesMessage).toBeVisible();
    }
  });
});