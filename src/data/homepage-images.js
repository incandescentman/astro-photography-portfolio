// Homepage Image Configuration
// Edit this file to control which images appear on the homepage and their sizes.
//
// Size Options:
// - `portrait` - Standard portrait size (1 column × 1 row)
// - `landscape` - Landscape/horizontal (2 columns × 1 row) 
// - `xlportrait` - Extra-large portrait (2 columns × 2 rows) - featured images
//
// Order Control:
// - Set `order: 1, 2, 3...` to force specific positions
// - Images without `order` will be auto-arranged by the optimizer
//
// Caption:
// - Provide a custom caption for each image
// - If not provided, the filename will be used (with dashes/underscores converted to spaces)

export const images = [
  // First row - Start with xlportrait on left, fill with portraits
  {
    order: 1,
    filename: 'vanessa-kirby.jpg',
    caption: 'Vanessa Kirby',
    size: 'xlportrait'
  },
  {
    order: 2,
    filename: 'dixit_nobel-physics.jpg',
    size: 'portrait',
    caption: 'Nobel Prize in Physics Ceremony'
  },
  {
    order: 3,
    filename: 'judd-apatow.jpg',
    caption: 'Judd Apatow',
    size: 'portrait'
  },
  {
    order: 4,
    filename: 'jeremy.jpg',
    caption: 'Jeremy Strong',
    size: 'portrait'
  },
  // Continue filling the grid - add portrait to complete the row under xlportrait
  {
    order: 5,
    filename: 'Lisa_Gilroy_at_SXSW_in_2025-1.jpg',
    caption: 'Lisa Gilroy at SXSW in 2025',
    size: 'portrait'
  },
  {
    order: 6,
    filename: 'jeremy-3.jpg',
    caption: 'Jeremy Strong',
    size: 'portrait'
  },
  {
    order: 7,
    filename: 'conan.jpg',
    caption: "Conan O'Brien",
    size: 'portrait'
  },
  // Add landscape items - they span 2 columns
  {
    order: 8,
    filename: 'jeremy-11.jpg',
    caption: 'Jeremy',
    size: 'landscape'
  },
  {
    order: 9,
    filename: 'vinod.jpg',
    caption: 'Vinod',
    size: 'landscape'
  },
  {
    order: 10,
    filename: 'jeremy-6.jpg',
    caption: 'Jeremy',
    size: 'portrait'
  },
  // Second xlportrait with proper surrounding
  {
    order: 11,
    filename: 'jay-dixit_red-carpet_01130.jpg',
    caption: 'Jay Dixit on the Red Carpet',
    size: 'xlportrait'
  },
  {
    order: 12,
    filename: 'jay-dixit_red-carpet_05923-1.jpg',
    caption: 'Jay Dixit Red Carpet',
    size: 'portrait'
  },
  {
    order: 13,
    filename: 'jeremy-4.jpg',
    caption: 'Jeremy',
    size: 'portrait'
  },
  {
    order: 14,
    filename: 'vinod-4.jpg',
    caption: 'Vinod',
    size: 'portrait'
  },
  // Continue filling - portrait under the xlportrait
  {
    order: 15,
    filename: 'jeremy-9.jpg',
    caption: 'Jeremy Strong',
    size: 'portrait'
  },
  {
    order: 16,
    filename: 'vinod-3.jpg',
    caption: 'Vinod',
    size: 'portrait'
  },
  {
    order: 17,
    filename: 'jay-dixit_red-carpet_05456.jpg',
    caption: 'Jay Dixit Red Carpet',
    size: 'portrait'
  },
  // Add landscape to create better flow
  {
    order: 18,
    filename: 'jay-dixit_red-carpet_08042.jpg',
    caption: 'Jay Dixit Red Carpet',
    size: 'landscape'
  },
  {
    order: 19,
    filename: 'Gabriel_LaBelle_at_the_2024_Toronto_International_Film_Festival_03_cropped.jpg',
    caption: 'Gabriel LaBelle at the 2024 Toronto International Film Festival',
    size: 'portrait'
  },
  {
    order: 20,
    filename: 'Jason_Collett_at_Ottawa_Jazz_Festival_in_2025_-_3.jpg',
    caption: 'Jason Collett at Ottawa Jazz Festival in 2025',
    size: 'portrait'
  },
  // Third xlportrait at the end
  {
    order: 21,
    filename: 'jeremy-7.jpg',
    caption: 'Jeremy Strong',
    size: 'xlportrait'
  },
  {
    order: 22,
    filename: 'jeremy-2.jpg',
    caption: 'Jeremy Strong',
    size: 'portrait'
  }
];
