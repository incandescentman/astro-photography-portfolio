- Jay Dixit Photography Portfolio - Developer Handoff

  



​** Overview

This is a static photography portfolio site built with Astro, hosted on
Vercel at photos.jaydixit.com. It supports automatic gallery generation
from folders, responsive masonry layout, full-screen lightbox viewing,
keyword search, tag-based filtering, per-photo liking, and optional
commenting via Giscus. All metadata is derived from filenames or
per-folder tags.json files.



​** Core Features



​*** 📁 Folder-Based Gallery Pages

- All photos live in public/photos/** folder

- Each subfolder becomes a separate gallery

- Example: public/photos/locarno-film-festival →
  /gallery/locarno-film-festival



​*** 🧱 Masonry Layout

- Pure CSS layout with column-count and break-inside: avoid

- Responsive grid that lazy-loads images



​*** 💡 Lightbox Viewer

- Powered by GLightbox

- Full-size viewer with zoom and nav arrows



​*** 📑 Captions from Filenames

- Filenames like maria-bakalova_locarno_2024.jpg become:

  "Maria Bakalova at Locarno in 2024"

- Year is optional

- Displayed under each photo



​*** 🔍 Search and Tag Filtering

- Single search input filters by:

  - Subject name

  - Event name

  - Tags (from filename or tags.json)

- Tags also appear as clickable pills (AND logic)

- Search and tags can be used together for progressive narrowing



​*** 🏷 Tags System

- Tags extracted from:

  - Filenames (e.g. _rain-night)

  - Folder names (e.g. /locarno → "locarno")

  - Optional tags.json file per folder

- tags.json format:

  {

  "filename.jpg": ["tag1", "tag2"]

  }

- If tags.json exists, it overrides filename tags



​*** ❤️ Likes

- Each photo displays a like button and live count

- Stored in Supabase photo_likes table:

  - photo_id: string (filename)

  - like_count: integer

- Uses Supabase anonymous access and row-level security

- Future: most-liked photos or tag analytics



​*** 💬 Giscus Comments

- Optional comment thread per gallery or per photo

- Uses GitHub Discussions via Giscus

- Enabled with Discussions on GitHub repo:

  incandescentman/jaydixit-photos



​*** 📦 Developer Tools



​**** File: scripts/generate-tags-json.js

- CLI tool to scan a folder of photos

- Parses tags from filename

- Writes a tags.json

- Run with:

  node scripts/generate-tags-json.js ./public/photos/locarno



​**** Astro Pages

- src/pages/gallery/[...folder].astro → renders a gallery page for each
  folder

- src/pages/index.astro → lists all galleries with thumbnails



​**** Components

- MasonryGallery.astro → handles the masonry layout

- PhotoLikeButton.astro → handles Supabase like button

- PhotoComments.astro → Giscus integration



​*** 🧭 Header and Branding

- Sticky header with site title: Jay Dixit Photos

- Placeholder for logo (square image)

- Clean typography and minimalist layout



​** Hosting

- Hosted on Vercel

- Site URL: https://photos.jaydixit.com

- Vercel project configured for Astro static output



​** Supabase Setup (Likes)

- Create a Supabase project: jaydixit-photos

- Enable table: photo_likes

- Schema:

  - id (uuid, default gen)

  - photo_id (text)

  - like_count (integer)

  - created_at (timestamp)

- RLS Policies:

  - Public read: USING (true)

  - Public write: USING (true)

- SQL Function: increment_like_count(photo_id TEXT)



​** Optional Future Enhancements

- Per-photo pages (slug-based)

- Location or date metadata via EXIF or json

- Tag popularity ranking

- Image upload UI with drag-and-drop

- Social share buttons per photo



​** Developer Notes

- Astro project uses import.meta.glob to dynamically load images

- All routes are filesystem-based

- No CMS: folder structure is the source of truth

- All content is static + light client-side JS (no SSR needed)



​** Deployment

- Astro static output

- Deployed via Vercel Git integration

- Custom domain: photos.jaydixit.com



​** Commands

- To generate tags: node scripts/generate-tags-json.js
  ./public/photos/[folder]

- To build Astro: npm run build

- To deploy (once Vercel linked): git push


Perfect --- Giscus is an excellent choice: lightweight,
privacy-friendly, and no cost if you're already on GitHub. It works
beautifully with static sites like Astro.

--------------

** *✅ Plan: Add *

** *Giscus Comments*

** * to Photo Pages*



We'll embed Giscus underneath each photo or beneath the gallery --- one
thread per *photo*, using the *filename* as a unique identifier.

--------------

** *🔧 Step-by-Step Setup*



*** *1. *

*** *Prepare a GitHub Repo for Giscus*



Giscus uses GitHub *Discussions* as the backend for comments.

- Go to your Astro site repo on GitHub

- Enable *Discussions*:

  → Settings → Features → ✅ Enable Discussions



*** *2. *

*** *Go to* [[https://giscus.app][*giscus.app*]] *and configure your widget*



Use the form to configure:

- *Repository*: your-username/your-repo-name

- *Discussion category*: e.g. General

- *Mapping*: pathname or *title* (we'll use title)

- *Page ↔️ Discussion Mapping*:

  - We'll pass in the *photo filename* as the term

- *Enable reactions, dark mode, etc.* (as desired)

- Click *"Copy Code"* when done



*** *3. *

*** *Install Giscus to your Astro project*



In Astro, you'll embed the Giscus component under each photo in the
lightbox or in the caption view.



**** *📄 Example: *

**** *PhotoComments.astro*

#+begin_example
---
const { filename } ~ Astro.props;
---
<script src~"https://giscus.app/client.js"
        data-repo="jaydixit/astro-photo-site"
        data-repo-id="YOUR_REPO_ID"
        data-category="General"
        data-category-id="YOUR_CATEGORY_ID"
        data-mapping="specific"
        data-term={filename}
        data-strict="0"
        data-reactions-enabled="1"
        data-theme="light"
        crossorigin="anonymous"
        async>
</script>
#+end_example

We'll pass in filename dynamically, e.g.:

#+begin_example
const filename = "vanessa-kirby_toronto-film-festival_2024.jpg"
#+end_example

That photo will then be linked to a unique Giscus thread titled the
same.

--------------

** *🧠 Where to Show Giscus*



You have two display options:



*** *Option 1: *

*** *Per-photo in Lightbox or Below*


- Comments appear below each full-size image

- ⬅️ Best for highly engaged, photo-specific conversation

- 🧩 Requires dynamic lightbox enhancement or a separate detail view



*** *Option 2: *

*** *Per-gallery page*


- One comment thread for each gallery (e.g., /gallery/tiff)

- ⬅️ Easiest to implement right now

- 📝 Visitors can leave general feedback on a batch of photos



You can start with *Option 2*, and later we can wire up per-photo Giscus
threads once individual photo pages/lightboxes are implemented with
dynamic routing.

--------------

** *✅ Next Steps*



Would you like me to:

1. Embed the Giscus component *at the bottom of every gallery page* now?

2. Then later add per-photo threads when we support detailed photo
   pages?



Also, please:

- Share the GitHub repo where this site lives (or your intended repo
  name)

- Enable *Discussions* in that repo



Once you confirm, I'll generate the Astro component + update the gallery
layout to include Giscus.


Perfect. Here's the Giscus integration plan for your site:

--------------

** *✅ Giscus Setup for *

** *incandescentman/jaydixit-photos*



*** *1. *

*** *GitHub Settings Checklist*


- ✅ Go to
  [[https://github.com/incandescentman/jaydixit-photos][github.com/incandescentman/jaydixit-photos]]

- 🔧 Enable *Discussions*:

  → Settings → Features → ✅ Enable Discussions

- 🪪 After enabling:

  - Visit [[https://giscus.app][giscus.app]]

  - Choose:

    - *Repository:* incandescentman/jaydixit-photos

    - *Discussion Category:* General (or create one)

    - *Mapping:* specific term ← we'll pass each photo filename

  - Copy the generated embed code --- you'll need the data-repo-id and
    data-category-id

--------------

** *🧱 Astro Implementation Plan*



*** *🔧 File: *

*** *src/components/PhotoComments.astro*

#+begin_example
---
const { filename } ~ Astro.props;
---
<script src~"https://giscus.app/client.js"
        data-repo="incandescentman/jaydixit-photos"
        data-repo-id="REPLACE_WITH_YOURS"
        data-category="General"
        data-category-id="REPLACE_WITH_YOURS"
        data-mapping="specific"
        data-term={filename}
        data-strict="0"
        data-reactions-enabled="1"
        data-theme="light"
        crossorigin="anonymous"
        async>
</script>
#+end_example

#+begin_quote
Replace the repo-id and category-id with the real values from giscus.app
#+end_quote



*** *📄 Usage*



In any gallery page:

#+begin_example
<PhotoComments filename="vanessa-kirby_toronto-film-festival_2024.jpg" />
#+end_example

--------------

** *✅ Initial Plan of Action*



*** *Phase 1: MVP*


- Embed PhotoComments at the *bottom of each gallery page*
  (/gallery/locarno, etc)

- Use the *folder name as the filename substitute*, e.g., locarno or
  red-carpet-tiff

  - → good enough to allow general commenting now



*** *Phase 2: Per-photo Comments (Optional)*


- When we introduce individual photo pages or enhance the lightbox,

  we'll pass each actual photo filename to Giscus for per-photo threads

--------------

** *📝 Next Step*



Would you like me to:

1. Add the PhotoComments.astro component to the project?

2. Embed it at the bottom of each gallery page using the folder name as
   the identifier for now?



You can also go ahead and:

- ✅ Enable Discussions in the GitHub repo

- ✅ Visit [[https://giscus.app][giscus.app]] and grab:

  - Your repo-id

  - Your category-id



Once you give me the green light, I'll bake the Giscus comments into the
build.

Here's your complete project specification formatted in Emacs Org-mode
syntax --- ready for you to drop into your org files.

--------------

#+begin_example
,* Jay Dixit Photography Portfolio – Project Spec


A static site generator (SSG)-powered photography portfolio using Astro, designed for automatic photo gallery creation from folders, with lightbox viewing, live keyword filtering, and semantic filename-driven metadata.

,** Architecture
| Component           | Tech / Tool                          |
|---------------------+--------------------------------------|
| Site Generator      | Astro                                |
| Layout              | CSS Masonry (column-count)           |
| Image Viewer        | GLightbox                            |
| Deployment          | Vercel                               |
| Hosting Domain      | photos.jaydixit.com                  |
| Image Source        | public/photos/**                     |
| Metadata Source     | File naming convention               |
| CMS                 | None (filename = metadata)           |

,** Features

,*** 📁 Automatic Gallery Routing
- Each folder in ~public/photos/~ becomes a gallery
- Example: ~public/photos/tiff~ → /gallery/tiff
- Nested folders are supported: ~/gallery/red-carpet/locarno~

,*** 🖼 Responsive Masonry Grid
- Pure CSS layout using ~column-count~ and ~break-inside: avoid~
- Lazy loading enabled
- Fully responsive from mobile to desktop

,*** 💡 GLightbox Viewer
- Full-screen lightbox with zoom and arrow navigation
- Grouped by gallery context

,*** 🧠 Filename-to-Caption Parsing
- Format: ~subject_event_year.jpg~
- Example: ~vanessa-kirby_toronto-film-festival_2024.jpg~
- Generates: ~Vanessa Kirby at the Toronto Film Festival in 2024~

,*** 🔤 Tag and Name Extraction
- Subject: parsed from the beginning of filename
- Event: parsed from middle section (slugified → title cased)
- Optional year (used in caption, but not for sorting)

,*** 🧩 Filterable Tags (via search)
- No dropdowns or tag chips
- Single search input: filters on subject, event, folder name
- Progressive narrowing
- Case-insensitive + slug-tolerant (hyphens, underscores, etc)

,*** 🔍 Live Search UI
- Input box appears at top of each gallery page
- Matches:
  - Subject (e.g. "Ana de Armas")
  - Event (e.g. "TIFF")
  - Tags (e.g. "first-nations", "oslo")
- Includes ⨉ "clear" button to reset

,*** 🧭 Site Navigation
- Sticky header:
  - Left: Logo (square)
  - Right: Text: "Jay Dixit Photos"
- Home page: ~/gallery/~ lists all folders with:
  - Folder name
  - First image as thumbnail
  - Link to page

,*** 🛠 Folder Structure Example
,#+BEGIN_EXAMPLE
/public/photos/
├── red-carpet/
│   ├── tiff/
│   ├── sundance/
├── portraits/
│   ├── studio/
│   ├── wikipedia/
├── places/
│   ├── ottawa/
│   ├── mexico/
│   ├── stockholm/
├── themes/
│   ├── fashion/
│   ├── first-nations/
│   ├── protest/
├── events/
│   ├── nobel/
│   ├── storytelling-workshops/
,#+END_EXAMPLE

,*** 📦 Image Management Workflow
- No markdown or frontmatter
- Just drag photos into folders
- Follow naming convention for full functionality
  - ~ana-de-armas_tiff.jpg~
  - ~maria-bakalova_locarno_2024.jpg~

,** Deployment

,*** 🔄 Vercel Setup
- GitHub repo connected to Vercel
- ~astro.config.mjs~ configured for static output
- Astro default adapter
- Domain: ~photos.jaydixit.com~
- Fully static site, no backend required

,** Future Optional Enhancements
- ~captions.json~ file per folder to override filename logic
- Tag chips for filtering (in addition to search)
- EXIF parsing (disabled for now)
- Gallery-level metadata (title, description, thumbnail) via JSON
- Upload dashboard or CMS layer (Netlify CMS, Cloudinary)

,** Philosophy
- Low-maintenance, high-impact design
- Metadata lives in the filename
- Visual clarity, fast browsing, no clutter
- Works offline and deploys instantly
#+end_example

--------------

Would you like this saved as a .org file for download, or converted into
.md, .pdf, or .html format as well?
