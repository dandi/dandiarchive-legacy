import {
  vAvatar,
  vBtn,
  vIcon,
  vListItem,
  vTextField,
  vTextarea,
} from 'jest-puppeteer-vuetify';

export const { CLIENT_URL } = process.env;

export const LOGIN_BUTTON_TEXT = 'Log In with GitHub';
export const LOGOUT_BUTTON_TEXT = 'Logout';
export const MY_DANDISETS_BTN_TEXT = 'My Dandisets';

export function uniqueId() {
  // TODO think of something cleaner
  return Date.now().toString();
}

export const TEST_USER_FIRST_NAME = 'Test';
export const TEST_USER_LAST_NAME = `User_${uniqueId()}`;

export const TEST_USER_INITIALS = `${TEST_USER_FIRST_NAME.charAt(0)}${TEST_USER_LAST_NAME.charAt(0)}`;

/**
 * Waits for all network requests to finish before continuing.
 */
export async function waitForRequestsToFinish() {
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
  } catch (e) {
    // ignore
  }
}

/**
 * Log in a user
 */
export async function login() {
  await expect(page).toClickXPath(vBtn(LOGIN_BUTTON_TEXT));
}

/**
 * Register a new user with a random username.
 *
 * @returns {object} { username, email, password, firstName, lastName }
 */
export async function registerNewUser() {
  const username = `user${uniqueId()}`;
  const email = `mr${username}@dandi.test`;
  const password = 'XtR4-S3curi7y-p4sSw0rd'; // Top secret

  const firstName = TEST_USER_FIRST_NAME;
  const lastName = `${TEST_USER_LAST_NAME}_${uniqueId()}`;

  await expect(page).toClickXPath(vBtn(LOGIN_BUTTON_TEXT));

  await waitForRequestsToFinish();

  // puppeteer sometimes can't detect the signup link to click, so just navigate to it manually.
  // This login/signup page is not used in production anyway, so we're not missing anything
  // in terms of testing.
  await page.goto(page.url().replace('/accounts/login', '/accounts/signup'));

  // API pages are not styled with Vuetify, so we can't use the vHelpers
  await expect(page).toFillXPath('//input[@name="email"]', email);
  await expect(page).toFillXPath('//input[@name="password1"]', password);
  await expect(page).toFillXPath('//input[@name="password2"]', password);

  // After the localStorage auto-redirect was added in
  // https://github.com/dandi/dandiarchive/commit/08331aa03c5a2a2e05880b899d2435779e2909f5,
  // puppeteer started tearing down the browser instance prematurely (immediately after
  // clicking the "signup" button below). To get around this, we temporarily open a new
  // tab which signals to puppeteer not to close the browser.
  const tempPage = await browser.browserContexts()[1].newPage();
  await tempPage.goto(CLIENT_URL);

  await page.bringToFront();
  // click signup button
  await expect(page).toClickXPath('//button');
  await waitForRequestsToFinish();
  await page.reload();

  await expect(page).toFillXPath('//input[@name="First Name"]', firstName);
  await expect(page).toFillXPath('//input[@name="Last Name"]', lastName);

  await expect(page).toClickXPath('//button');
  await waitForRequestsToFinish();

  await page.goto(CLIENT_URL, { timeout: 0 });
  await waitForRequestsToFinish();
  await tempPage.close();

  return {
    username, email, password, firstName, lastName,
  };
}

/**
 * Registers a new dandiset.
 *
 * @param {string} name
 * @param {string} description
 *
 * @returns {string} identifier of the new dandiset
 */
export async function registerDandiset(name, description) {
  await expect(page).toClickXPath(vBtn('New Dandiset'));
  await expect(page).toFillXPath(vTextField('Name*'), name);
  await expect(page).toFillXPath(vTextarea('Description*'), description);
  await expect(page).toClickXPath(vBtn('Register dataset'));
  await waitForRequestsToFinish();
  return page.url().split('/').pop();
}

/**
 * Clears browser cookies and cache.
 */
export async function clearCookiesAndCache() {
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await client.send('Network.clearBrowserCache');
}

/**
 * Disables all cookies (3rd party and otherwise) in the current browser session.
 */
export async function disableAllCookies() {
  const client = await page.target().createCDPSession();
  await client.send('Emulation.setDocumentCookieDisabled', { disabled: true });
  await page.reload();
  await waitForRequestsToFinish();
}

/**
 * Log out a user
 */
export async function logout() {
  await expect(page).toClickXPath(vAvatar(TEST_USER_INITIALS));
  await page.waitForTimeout(500);
  await expect(page).toClickXPath(vListItem(LOGOUT_BUTTON_TEXT, { action: vIcon('mdi-logout') }));
  await clearCookiesAndCache();
}
