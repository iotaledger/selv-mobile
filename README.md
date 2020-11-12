# Selv

## Run in development mode

#### 1. Install Node.JS

First you need to install [Node.JS](https://nodejs.org) if you haven’t done that already.

#### 2. Install Yarn

Install [Yarn](https://yarnpkg.com/) Node.js dependency manager:

```
curl -o- -L https://yarnpkg.com/install.sh | bash
```

#### 3. Clone repository

Clone repository by running:

```
git clone https://github.com/iotaledger/selv-mobile.git
```

#### 4. Install dependencies

To install the dependencies, run:

```
yarn
```

#### 5. Run in development mode

To run the application locally, run:

```
yarn web
```

and open `http://localhost:3001` in your favourite browser.

## Build appliciation

To build application for iOS or android, some additional [dependencies](https://capacitor.ionicframework.com/docs/getting-started/dependencies) need to be installed.

To start the build process, run `yarn ios` or `yarn android`.

## Howto add custom credentials

### Add Credential Schemas

Add Schemas to `ui/lib/identity/schemas/index`

### Add DID Mapping

Add DID enrichments to `ui/lib/identity/schemas/index`

possible overrides:

-   issuerLabel
-   logo
-   theme

Add logo to `ui/assets` TODO: Dimensions / Format

### Generate Credentials

Requires Node v12+

`yarn cli SCHEMANAME path/to/data.json`

use QR from `.cli/credential.svg`

### Accept Credentials

use the app

### Verify Credentials

use another app ;)
