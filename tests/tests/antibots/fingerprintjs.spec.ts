import { expect, test } from '../global-setup';

test('botdetection', async ({ page }) => {
    await page.goto('https://fingerprint.com/products/bot-detection/');

    expect(
        await page.waitForSelector('h2 >> text=You are not a bot', {
            timeout: 20_000,
        })
    ).toBeTruthy();
});
