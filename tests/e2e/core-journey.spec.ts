import { expect, test } from '@playwright/test'

test('creates a local plan and starts a guided workout', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /workout plan that fits/i })).toBeVisible()
  await page.getByRole('link', { name: /build my plan/i }).click()

  await page.getByLabel(/understand my own condition/i).check()
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByRole('button', { name: /generate my plan/i }).click()

  await expect(page.getByRole('heading', { name: /your plan, at a glance/i })).toBeVisible()
  await expect(page.getByText(/planner 1.0.0/i)).toBeVisible()
  await page.getByRole('link', { name: /check in & start/i }).click()
  await expect(page.getByRole('heading', { name: /has anything changed/i })).toBeVisible()
  await page.getByRole('button', { name: /start as planned/i }).click()
  await expect(page.getByText(/step 1 of/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /complete step/i })).toBeVisible()

  await page.reload()
  await expect(page.getByText(/step 1 of/i)).toBeVisible()
})

test('remains usable at a narrow mobile viewport', async ({ page }) => {
  await page.goto('/')
  const bodyWidth = await page.locator('body').evaluate((element) => element.scrollWidth)
  expect(bodyWidth).toBeLessThanOrEqual(390)
  await expect(page.getByRole('link', { name: /build my plan/i })).toBeVisible()
})
