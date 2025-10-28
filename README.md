# N.E.S Duck Game Simulator

**Typescript version of the classic Duck Game Simulator**

## Thanks to

JSLegendDev [youtube tutorial here: ](https://www.youtube.com/watch?v=UZSmn3n3wqE)

## Files Included
```
duckGame/
├── README.md
├── .gitignore
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package-lock.json
├── package.json
├── public/
│   ├── fonts
│       ├── nintendo-nes-font
│           └── license.txt
│           └── nintendo-nes-font.tff
│           └── readme.txt
│   ├── graphics
│       └── background.png
│       └── cursor.png
│       └── duck.png
│       └── menu.png
│       └── text-box.png
│       └── dog.png
│   ├── sounds
│       └── barking.wav
│       └── credits.txt
│       └── fall.wav
│       └── flapping.ogg
│       └── forest-ambiance.wav
│       └── gun-shot.wav
│       └── impact.wav
│       └── laughing.wav
│       └── quacking.wav
│       └── sniffing.wav
│       └── successful-hunt.wav
│       └── ui-appear.wav
├── src
│   ├── entities
│       └── dog.ts
│       └── duck.ts
│   └── constants.ts
│   └── gameManager.ts
│   └── kaplayCtx.ts
│   └── main.ts
│   └── utils.js

```

### Note:
In order to get audioCtx to work from a global context.  May not work in later versions of Kaplay.
```javascript
    const audioCtx = (k as any).audioCtx;
```

### Run
Download zip

```javascript
    npm install
```
then
```javascript
    npm run dev
```
optionally build
```javascript
    npm run build
```
testing build
```javascript
    npm run preview
```