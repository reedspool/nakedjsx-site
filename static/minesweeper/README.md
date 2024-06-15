# Hypersweeper Static

This is the public/ directory of https://github.com/reedspool/hypersweeper. It works as a standalone website with no server, but it relies on a service worker. That means if you force refresh (Ctrl-Shift-R), then it will break until you perform a normal page load or refresh again.

To copy to my website, I use

```sh
rm -rf ~/reeds-website/static/minesweeper
cp -r ~/projects/minesweeper-hypermedia/public ~/reeds-website/static/minesweeper
```
