# A Heart Made of Stars

A small website for one person. You type your name and the name of someone you like, and a blue heart made of tiny glowing dots appears on a black screen. Then you copy a link and send it to them. When they open it, they see the heart with both your names on it.

## What it does

- Black background, nothing else on the screen.
- The dots drift in from all over and come together as a heart in about two seconds.
- The heart beats, with a small double thump like a real one, and tilts a little when you move your mouse or phone.
- Tap or click the heart and the dots burst outward, then slowly find their way back.
- Your names show up under the heart, with the line "Somewhere in this universe, my heart chose you."
- There's a button that opens a short letter. It has a default message, but you can write your own before you share the link.
- Sound is there if you want it (a soft pad and a few chimes), but it's off until you turn it on. Nothing plays by itself.
- It works on phones and desktop. The number of dots changes depending on the screen so it doesn't lag.

## Running it on your computer

You need Node installed. Then:

```bash
npm install
npm run dev
```

Open http://localhost:5173 and you're in.

## Sharing a link

The names go in the address, so you can make a link by hand:

```
http://localhost:5173/?from=Anad&to=Sophia
```

If you want your own message in the letter, add `msg`:

```
http://localhost:5173/?from=Anad&to=Sophia&msg=You%20are%20my%20universe
```

Whoever opens it skips the form and goes straight to the heart. The site also has a "Copy link" button, so you don't have to type any of this yourself.

One catch: a `localhost` link only works on your own computer. To send it to someone you have to put the site online first (next section).

## Putting it online

All three of these are free.

**Vercel.** Run `npx vercel` in the project folder and press Enter through the questions. You get a link at the end.

**Netlify Drop.** Run `npm run build`, go to https://app.netlify.com/drop, and drag the `dist` folder onto the page.

**GitHub Pages.** Push the project to GitHub and turn on Pages in the repo settings. If the page comes up blank, set `base` in `vite.config` to your repo name.

## Made with

React 19, TypeScript, Vite, Tailwind CSS v4, the HTML canvas, the Web Audio API, and Lucide icons.
