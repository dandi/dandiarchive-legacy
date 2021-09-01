import {
  vBtn,
  vChip,
  vIcon,
  vListItem,
  vTextField,
} from 'jest-puppeteer-vuetify';

import {
  uniqueId,
  registerNewUser,
  registerDandiset,
  logout,
  waitForRequestsToFinish,
  clearCookiesAndCache,
  uploadAssets,
} from '../util';

describe('dandiset landing page', () => {
  it('add an owner to a dandiset', async () => {
    const { email: otherUser } = await registerNewUser();
    await logout();

    await clearCookiesAndCache();

    const { email: owner } = await registerNewUser();

    const id = uniqueId();
    const name = `name ${id}`;
    const description = `description ${id}`;
    await registerDandiset(name, description);

    await waitForRequestsToFinish();

    // "owner" should be the only owner
    await expect(page).not.toContainXPath(vChip(otherUser));
    await expect(page).toContainXPath(vChip(owner));

    // search for otherUser and add them as an owner
    await expect(page).toFillXPath('//input[@placeholder="enter email address"]', otherUser);
    await waitForRequestsToFinish();
    await expect(page).toClickXPath(vListItem(otherUser));

    await waitForRequestsToFinish();

    // otherUser should be an owner now, too
    await expect(page).toContainXPath(vChip(otherUser));
    await expect(page).toContainXPath(vChip(owner));
  });

  it('publish a dandiset', async () => {
    const { apiKey } = await registerNewUser();

    const id = uniqueId();
    const name = `name ${id}`;
    const description = `description ${id}`;
    const identifier = await registerDandiset(name, description);

    // Fix "no assets" validation error
    // await expect(page).toContainXPath(vBtn('This Dandiset has 2 metadata'));
    await uploadAssets(identifier, 'valid_assets', apiKey);
    await page.waitForTimeout(2000);
    await page.reload();
    await waitForRequestsToFinish();
    // await expect(page).toContainXPath(vBtn('This Dandiset has 1 metadata'));

    // Fix license validation error
    await expect(page).toClickXPath(vBtn('Metadata'));
    await expect(page).toClickXPath('//input[@id="license"]');
    await page.waitForTimeout(500);
    await expect(page).toClickXPath(vListItem('spdx:CC0-1.0'));
    await expect(page).toClickXPath(vTextField('Acknowledgement')); // click something else to trigger validation
    await expect(page).toClickXPath(vIcon('mdi-content-save-alert'));
    await page.waitForTimeout(2000); // give enough time for saving to finish
    await expect(page).toClickXPath(vIcon('mdi-arrow-left')); // exit the meditor
    await waitForRequestsToFinish();

    // await expect(page).not.toContainXPath(vBtn('This Dandiset has 1 metadata'));

    await expect(page).toClickXPath(vBtn('Publish'));

    // TODO: make assertions about the published dandiset
  });
});
