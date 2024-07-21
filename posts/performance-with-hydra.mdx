# Performance with Hydra

## Logbook

### Sat Jul 20 13:44:18 GMT-0700 (Pacific Daylight Time) 2024

Equipment Checklist

- [ ] Computer
- [ ] Mouse
- [ ] Speaker
- [ ] Keyboard
- [ ] USB to HDMI dongle
- [ ] Push this page to github

Pre-flight Checklist

- [ ] Turn on Speaker
- [ ] Open both videos [purple hat](https://www.youtube.com/watch?v=hOEMsqWx4nE) and [cooking by the book](https://www.youtube.com/watch?v=YUT22fHzGYA)
- [ ] Open [empty hydra](https://hydra.ojack.xyz/?code=0)
- [ ] Open this page on phone for reference
- [ ] Write `hush()`
- [ ] Maximize the text
- [ ] Run this script and erase it to remove the editor chrome()
- [ ] Announce flashing lights warning

```js
document
  .querySelector('#info-container')
  .remove()
```

#### First, Purple Hat 

[SOFI TUKKER - Purple Hat (Official Video)](https://www.youtube.com/watch?v=hOEMsqWx4nE)

```js
noise(10, 2)
.add(solid(0.8, 0.6))
// Line
.out(o1)

solid(1, 0, 1)
.out(o2)

src(o1)
  .layer(
    src(o2)
      .mask(shape(4)))
  .out()

src(o0)
  .modulateRotate(o1)
  .modulateScale(o1)
  .blend(o3, 0.9)
  // Line
  .out(o3)

render(o3)
```

#### Morphs into Second, Cooking By The Book ft Lil Jon

[LazyTown Cooking By The Book ft Lil Jon](https://www.youtube.com/watch?v=YUT22fHzGYA)

```js
noise(20, 2) // .out()
  .scrollY(0, -0.1)

  .out(o1)

osc(10, 0.2, 2) // .out()
  .rotate(-Math.PI / 2)
  .blend(
    src(o2)
      .rotate(Math.PI, 0.1),
      0.9
  )
  .scale(0.8)
  .out(o2)

render(o2)

src(o2)
  .add(o1)
  .blend(o0, 0.6)
  .modulate(o1)
  .modulateRotate(o1, () => mouse.y/ height)
  .scale(1.2, () => mouse.x / width)
  .out(o0)
  
  render(o0)
```

#### Backup 

WIP, didn't get to a place I loved

[Jason Derulo - Wiggle feat. Snoop Dogg [Official Music Video]](https://www.youtube.com/watch?v=hiP14ED28CA)

```js
const { sin, cos, tan, min, max, PI } = Math
speed=0.4
mult = (f, n) => () => n * f()
neg = (f) => mult(f, -1)
clamp = (f, min, max) => () => min(max, max(min, f()))
mouseY = clamp(() => mouse.y / height, 0, 1)
mouseX = clamp(() => mouse.x / width, 0, 1)

speed=0.4
osc(2, 2, [2, 6, 12].smooth()).saturate(0.2).scale(1, -1, 0).kaleid(4).out(o1)
src(o1).modulateScale(o2, mouseY).modulateRotate(o2, mouseY).blend(o0, mult(mouseY, 1)).out(o0)
osc(20, .2, () => mouse.x /width).thresh().layer(shape(99).color(1, 1, 0).scrollX().scale(2, -0.1).luma()).scale(1, mouseX).out(o2)
render()
```
