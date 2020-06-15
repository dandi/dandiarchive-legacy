# End-to-End Tests

The end-to-end tests use [Puppeteer](https://github.com/puppeteer/puppeteer/) and [Jest](https://jestjs.io/en/) to connect to a running instance of the application and use it through a browser like a normal user would.

## Installation
The test suite depends on a helper utility called `jest-puppeteer-vuetify` which generates XPaths used to locate Vuetify components.
Eventually it will be moved out into it's own repository, but for now it is included in this repo.
It needs to be built before tests can be run.

```bash
# Build jest-puppeteer-vuetify
cd test/jest-puppeteer-vuetify
yarn
yarn run build

# Install test
cd ..
yarn
```

Puppeteer includes a bundled Chromium executable, but not all the various Chrome dependencies.
This is not generally an issue in development environments where Chrome is already installed.
Be aware of this when setting up CI or Docker images though.

## Running Tests
You will need a running instance of the app, both the `web` and `girder` components.
Assuming the web app is running at `http://localhost:8085`:
```bash
# within "test"
CLIENT_URL=http://localhost:8085 yarn run test
```

## Debugging Tests
Frequently when writing tests, they will not work the first time.
For browser based tests, it is very helpful to be able to see the state of the browser at the point of failure.
Use this command to run the browser in headful mode and extend the Jest test timeout to 1 hour:
```bash
# within "test"
CLIENT_URL=http://localhost:8085 yarn run test-debug
```
You can also include `await jestPuppeteer.debug();` at any point in the test to create a manual breakpoint.

## Writing Tests

### Behavior Driven Development (BDD)
Jest encourages BDD testing syntax.
All tests should be formatted roughly like this:
```javascript
describe('thing being tested', () => {
  it('should behave like this', async () => {
    // ... test steps ...
  });
  it('does the right thing', async () => {
    // ... test steps ...
  });
});
```

### expect-puppeteer
Puppeteer provides several very useful integrations with Jest, including the `expect-puppeteer` library.
It registers several new methods on the Jest `expect` object to provide common browser operations.
For example:
```javascript
await expect(page).toFill('input#username', 'DandiDan');
await expect(page).toClick('input#submit`);
```

### jest-puppeteer-vuetify
This is a utility which both makes it easier to use XPaths with jest and puppeteer, and generates XPaths to locate Vuetify components.
For now it is hosted in a subdirectory, but eventually it will be broken out into it's own repository.
If you ever need to make changes to `jest-puppeteer-vuetify` code, you must rebuild it and reinstall it in `test`:
```bash
# Rebuild jest-puppeteer-vuetify
cd jest-puppeteer-vuetify
yarn run build

# Reinstall test
cd ..
yarn install --check-files
```
