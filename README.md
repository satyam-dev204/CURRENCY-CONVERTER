# Currency Converter

## Build

```sh
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

To create the production files:

```sh
npm run build
```

The deployable static files are generated in `dist`. The converter uses a public exchange-rate API and does not require environment variables or API keys.