# Our Song Bucket — love-bucket-of-songs

A bucket list of songs for Mena and Ammar. Sixteen starters, plus your own.
Tick one each time you sing it together — the bar fills as the list gets sung.

Live: https://menaammarpro.github.io/love-bucket-of-songs/

## How it works

- **Sing it** — tap the note to mark a song as sung (dated). Tap again to undo.
- **Surprise me** — picks a song you haven't sung yet and highlights it.
- **Add a song** — your own title, artist and a little "why it's ours" note.
- **Send one for tonight** — copies a `?song=<slug>` link; whoever opens it sees
  *"Ammar picked ... for tonight"* and the song lights up.

## Storage key

- `mena-songbucket` — `{ done: { "<slug>": "YYYY-MM-DD" }, custom: [{ slug, title, artist, why }] }`

Made with love, just for you ♥
