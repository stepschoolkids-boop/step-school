# Official brand assets

Drop the school's official files here with these exact names (formats as supplied;
Riko and logo need transparent backgrounds because they sit on navy):

```
brand/logo.png        primary logo — paw mark + "Step Kids" wordmark, horizontal
brand/logo-mark.png   paw mark only (also copy to src/app/icon.png for the favicon)
riko/riko-hero.png    hero / main-character Riko
riko/riko-start.png   Riko hatching from the egg      (Start, Riko!)
riko/riko-speak.png   Riko with pencil and notebook   (Speak, Riko!)
riko/riko-read.png    Riko with glasses and book      (Read, Riko!)
riko/riko-win.png     Riko in cap and gown with trophy (Win, Riko!)
books/book-start.png  official cover 1
books/book-speak.png  official cover 2
books/book-read.png   official cover 3
books/book-win.png    official cover 4
```

Paths, dimensions and alt text are registered once in `src/content/assets.ts`.
Run `npm run assets:check` to confirm every file is present.
