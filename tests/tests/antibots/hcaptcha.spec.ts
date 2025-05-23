import { ElementHandle, expect, test } from '../global-setup';
import { clickLocatorWithMouse, sleep } from '../utils';

test('epicgames', async ({ page }) => {
    await page.goto(`https://epicgames.com/id/login`);
    const apiResponsePromise = page.waitForResponse(
        (response) =>
            response.request().method() === 'POST' &&
            response.url().startsWith('https://www.epicgames.com/id/api/login')
    );
    await page.locator('input#email').focus();
    await page
        .locator('input#email')
        .pressSequentially(
            Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + '@gmail.com',
            { delay: 20 }
        );
    await page.keyboard.press('Tab');
    await page
        .locator('input#password')
        .pressSequentially(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(5) + 'AC?_', {
            delay: 20,
        });
    await page.keyboard.press('Enter');

    const apiResponse = await apiResponsePromise;
    expect((await apiResponse.json()).errorCode).toBe('errors.com.epicgames.account.invalid_account_credentials');
});

test('discord', async ({ page }) => {
    await page.goto(`https://discord.com/login`);
    await page
        .locator('input[name="email"]')
        .pressSequentially(
            Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + '@gmail.com',
            { delay: 20 }
        );
    await page.keyboard.press('Tab');
    await page
        .locator('input[name="password"]')
        .pressSequentially(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(5) + 'AC?_', {
            delay: 20,
        });
    await page.keyboard.press('Enter');

    console.log('Waiting for captcha frame');
    const captchaIframe = (await page.waitForSelector(
        'iframe[src^="https://newassets.hcaptcha.com/captcha/v1"][style*="width"]'
    )) as ElementHandle<HTMLIFrameElement>;
    const captchaFrame = (await captchaIframe.contentFrame())!;
    console.log('Captcha frame found');

    const apiResponsePromise = page.waitForResponse(
        (response) =>
            response.request().method() === 'POST' && response.url().startsWith('https://discord.com/api/v9/auth/login')
    );

    await clickLocatorWithMouse(captchaFrame, 'div#checkbox');
    console.log('Captcha clicked');

    const apiResponse = await apiResponsePromise;
    expect((await apiResponse.json()).code).toBe(50035);
});

test('steam', async ({ page }) => {
    const email = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + '@gmail.com';
    await page.goto(`https://store.steampowered.com/join`);
    await page.locator('input[name="email"]').pressSequentially(email, { delay: 100 });
    await page.keyboard.press('Tab');
    await page.locator('input[name="reenter_email"]').pressSequentially(email, {
        delay: 100,
    });

    await page.locator('input#i_agree_check').click();

    const captchaIframe = (await page.waitForSelector(
        'iframe[src^="https://newassets.hcaptcha.com/captcha/v1"][style*="width"]'
    )) as ElementHandle<HTMLIFrameElement>;
    const captchaFrame = (await captchaIframe.contentFrame())!;
    await clickLocatorWithMouse(captchaFrame, 'div#checkbox');
    console.log('Captcha clicked');

    await sleep(10000);
    await page.locator('button#createAccountButton').click();

    const apiResponsePromise = page.waitForResponse(
        (response) =>
            response.request().method() === 'POST' &&
            response.url().startsWith('https://store.steampowered.com/join/ajaxcheckemailverified')
    );

    const apiResponse = await apiResponsePromise;
    expect((await apiResponse.json()).success).toBe(36);
});
