/* eslint-disable no-await-in-loop */

import {
  uniqueId,
  registerNewUser,
  registerDandiset,
  waitForRequestsToFinish,
  CLIENT_URL,
  logout,
} from '../util';

describe('ensures dandiset identifiers are incremented correctly', () => {
  it('creates a bunch of new dandisets while verifying that their IDs are correct', async () => {
    jest.setTimeout(60000 * 30); // Temporarily increase timeout to 30 mins for this test

    // Create 2 users and create 500 dandisets with each of them
    for (let i = 0; i < 2; i += 1) {
      // register user and create a new dandiset
      await registerNewUser();
      const initialId = uniqueId();
      const initialName = `name ${initialId}`;
      const initialDescription = `description ${initialId}`;
      const initialIdentifier = await registerDandiset(initialName, initialDescription);
      await page.goto(CLIENT_URL);
      await waitForRequestsToFinish();

      for (
        let latestIdentifier = Number(initialIdentifier);
        latestIdentifier < Number(initialIdentifier) + 500;
        latestIdentifier += 1
      ) {
        const id = uniqueId();
        const name = `name ${id}`;
        const description = `description ${id}`;
        const identifier = await registerDandiset(name, description);

        expect(Number(identifier)).toBe(latestIdentifier + 1);

        await page.goto(CLIENT_URL);
        await waitForRequestsToFinish();
      }
      await logout();
    }
  });
});
