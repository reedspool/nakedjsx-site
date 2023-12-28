# Server for Reed's Website

## Usage

Docker CLI required.

Make sure your terminal is in this directory and not the git project root.

For local development, to build and run the server:

```sh
npm run docker:build && npm run docker:run
```

To deploy ([`flyctl` CLI required](https://fly.io/docs/hands-on/install-flyctl/)):

```sh
npm run deploy
```
