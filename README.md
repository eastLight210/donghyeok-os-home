# Donghyeok Home

[Donghyeok](https://donghyeok.net) is a minimal black-and-white personal home with an interactive application reel and readable content panels.

The approved design and interaction contract is in [the minimal-home specification](docs/design/05-minimal-home.md).

## Development

```sh
npm install
npm run dev
```

Before publishing changes, run:

```sh
npm test
npm run lint
npm run build
```

## Deployment

Cloudflare Workers Builds deploys the `main` branch to the `donghyeok-os-home` Worker. Production is served from [donghyeok.net](https://donghyeok.net).
