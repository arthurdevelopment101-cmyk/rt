import { Product, Review } from "./types";

export const CATEGORIES = [
  { id: "all", name: "All Collections" },
  { id: "fine-jewelry", name: "Fine Jewelry" },
  { id: "timepieces", name: "Timepieces" },
  { id: "necklaces", name: "Necklaces" },
  { id: "rings", name: "Rings" },
  { id: "earrings", name: "Earrings" },
  { id: "bracelets", name: "Bracelets" },
  { id: "leather-goods", name: "Leather Goods" },
  { id: "accessories", name: "Accessories" }
];

export const PRODUCTS: Product[] = [
  {
    id: "sculpted-aurelian-ring",
    name: "Sculpted Aurelian Ring",
    categoryName: "Fine Jewelry",
    categoryId: "fine-jewelry",
    price: 2450,
    image: "images/sculpted-aurelian-ring.jpg",
    secondaryImages: [
      "images/sculpted-aurelian-ring.jpg",
      "images/sculpted-aurelian-ring-2.jpg",
      "images/sculpted-aurelian-ring-3.jpg",
      "images/sculpted-aurelian-ring-4.jpg"
    ],
    tagline: "\"A tribute to the enduring beauty of classical architecture, reimagined for the modern aesthetic.\"",
    description: "The Sculpted Aurelian Ring is hand-forged from solid 18k recycled gold. Its signature textured surface is achieved through a proprietary \"cire perdue\" process, ensuring no two rings are identical. Designed to be a lifetime companion, it embodies the philosophy that details define you.",
    materialOptions: ["#E5D5BC", "#E5E4E2", "#B76E79"], // Gold, Platinum, Rose Gold
    sizeOptions: ["06", "07", "08", "09"],
    details: [
      "18k Solid Recycled Yellow Gold",
      "Width: 6.5mm",
      "Weight: ~12.5g (variable by size)",
      "Hand-finished with a matte-satin luster",
      "Sustainably sourced materials"
    ],
    craftsmanship: "Each piece undergoes a rigorous 40-hour creation process by our master artisans in Florence. The Aurelian series utilizes ancient Roman casting techniques fused with modern precision engineering."
  },
  {
    id: "eternal-bangle",
    name: "Eternal Bangle",
    categoryName: "Bracelets",
    categoryId: "bracelets",
    price: 1250,
    image: "images/eternal-bangle.jpg",
    secondaryImages: [
      "images/eternal-bangle.jpg"
    ],
    tagline: "\"Minimalist geometry wrapped around your wrist. A golden state of mind.\"",
    description: "The Eternal Bangle is custom carved with a flat brushed surface that captures the light with absolute grace. Crafted in premium eco-friendly recycled metals to preserve artisan value.",
    materialOptions: ["#E5D5BC", "#E5E4E2"],
    sizeOptions: ["S", "M", "L"],
    details: [
      "18k Solid Gold plating over recycled silver base",
      "Width: 8mm",
      "Extremely durable dual-locking clasp",
      "Ethically manufactured in local Italian design hubs"
    ]
  },
  {
    id: "heritage-watch-4",
    name: "Heritage Watch No. 4",
    categoryName: "Timepieces",
    categoryId: "timepieces",
    price: 2800,
    image: "images/heritage-watch-4.jpg",
    secondaryImages: [
      "images/heritage-watch-4.jpg"
    ],
    tagline: "\"Artisan mechanical complexity combined with an executive premium aesthetic.\"",
    description: "A close-up luxury timepiece featuring a custom V-shaped clasp paired with a premium hand-braided leather band. Its Swiss-made mechanical movement guarantees decades of accurate tracking.",
    materialOptions: ["#5F5E5B", "#E5D5BC"],
    sizeOptions: ["One Size"],
    details: [
      "Scratch-resistant curved sapphire crystal",
      "Surgical-grade stainless steel & genuine leather strap",
      "5 ATM Water Resistance rating",
      "Artisanal silver mechanical movement viewable case-back"
    ]
  },
  {
    id: "geometric-aura",
    name: "Geometric Aura",
    categoryName: "Necklaces",
    categoryId: "necklaces",
    price: 950,
    image: "images/geometric-aura.jpg",
    secondaryImages: [
      "images/geometric-aura.jpg"
    ],
    tagline: "\"Floating lines that frame your neckline with an understated golden glow.\"",
    description: "A minimal 18k gold necklace adorned with a small, multi-faceted geometric pendant. Highly editorial in its construction, it matches casual wear as seamlessly as it complements evening gowns.",
    materialOptions: ["#E5D5BC", "#E5E4E2"],
    sizeOptions: ["16\"", "18\"", "20\""],
    details: [
      "18k solid recycled gold chain",
      "Adjustable lobster-claw closure",
      "Hand-polished mirror shine",
      "Weight: ~4.5g"
    ]
  },
  {
    id: "vero-signet",
    name: "Vero Signet",
    categoryName: "Rings",
    categoryId: "rings",
    price: 3400,
    image: "images/vero-signet.jpg",
    secondaryImages: [
      "images/vero-signet.jpg"
    ],
    tagline: "\"The ultimate sign of sophistication. Diamond-encrusted power.\"",
    description: "An incredibly prestigious signet ring made of Solid White Gold and studded with flawless VS1 ethically-sourced diamonds. Its heavy profile provides an unmistakable presence of high-end luxury.",
    materialOptions: ["#E5E4E2", "#E5D5BC"],
    sizeOptions: ["07", "08", "09", "10", "11"],
    details: [
      "Solid 18k White Gold custom casting",
      "VS1 Clear Diamonds total carat weight: 1.85ctw",
      "Exclusive VERO engraving on inner band",
      "Includes protective leather vault box"
    ]
  },
  {
    id: "desert-moon-hoops",
    name: "Desert Moon Hoops",
    categoryName: "Earrings",
    categoryId: "earrings",
    price: 720,
    image: "images/desert-moon-hoops.jpg",
    secondaryImages: [
      "images/desert-moon-hoops.jpg"
    ],
    tagline: "\"Inspired by quiet desert nights under a golden crescent moon.\"",
    description: "Classic gold hoops redesigned with a subtly organic hammered finish, completed with delicate natural saltwater pearls. Elegance simplified.",
    materialOptions: ["#E5D5BC"],
    sizeOptions: ["One Size"],
    details: [
      "18k solid gold wire with secure click back",
      "Handmade in Rome by master jewelry artisans",
      "Natural premium grade freshwater pearl accents",
      "Hypoallergenic and suitable for daily wear"
    ]
  },
  {
    id: "artisan-watch-roll",
    name: "Artisan Watch Roll",
    categoryName: "Accessories",
    categoryId: "accessories",
    price: 450,
    image: "images/artisan-watch-roll.jpg",
    secondaryImages: [
      "images/artisan-watch-roll.jpg"
    ],
    tagline: "\"Safeguard your most prized mechanical companions in pure tanned leather.\"",
    description: "Our signature leather watch roll is hand-stitched from full-grain vegetable-tanned leather. Features three plush cushions to protect watch faces and brackets.",
    materialOptions: ["#625E56", "#E5D5BC"],
    sizeOptions: ["3 Slots"],
    details: [
      "Full-grain cowhide leather structure",
      "Plush ultra-suede lining to protect watches",
      "Removable pillows with secure snap system",
      "Sustainably tanned and sourced leather"
    ]
  },
  {
    id: "lucent-chain",
    name: "Lucent Chain",
    categoryName: "Bracelets",
    categoryId: "bracelets",
    price: 1850,
    image: "images/lucent-chain.jpg",
    secondaryImages: [
      "images/lucent-chain.jpg"
    ],
    tagline: "\"Dainty platinum sparkles that follow your wrist's every movement.\"",
    description: "A solid platinum link chain bracelet featuring a singular brilliant-cut diamond. Fits with light and elegant grace, reflecting understated luxury.",
    materialOptions: ["#E5E4E2", "#E5D5BC"],
    sizeOptions: ["6.5\"", "7.0\"", "7.5\""],
    details: [
      "Solid 950 Platinum structure",
      "0.15ct Round Brilliant Diamond (F color, VS1 clarity)",
      "Secure spring-ring closure",
      "Polished to a flawless mirror luster"
    ]
  },
  {
    id: "essential-cardholder",
    name: "Essential Cardholder",
    categoryName: "Leather Goods",
    categoryId: "leather-goods",
    price: 220,
    image: "images/essential-cardholder.jpg",
    secondaryImages: [
      "images/essential-cardholder.jpg"
    ],
    tagline: "\"Minimalize your pocket with custom tanned Italian calfskin leather.\"",
    description: "A pocket companion that embodies modern restraint. Gold embossed VERO logo, designed with four card slots and one main pocket for currency folded neatly.",
    materialOptions: ["#211B12", "#625E56"], // black, mocha
    sizeOptions: ["One Size"],
    details: [
      "100% Genuine Italian calfskin leather",
      "Hand-sewn edges with heavy-gauge wax thread",
      "Extremely slim profile (only 4mm thick)",
      "Vero logo stamped in authentic 24k gold leaf"
    ]
  },
  {
    id: "baguette-solitaire",
    name: "Baguette Solitaire Ring",
    categoryName: "Rings",
    categoryId: "rings",
    price: 1250,
    image: "images/baguette-solitaire.jpg",
    secondaryImages: [
      "images/baguette-solitaire.jpg"
    ],
    isNew: true,
    tagline: "\"Flawless baguette-cut diamond suspended over clean polished gold.\"",
    description: "The Baguette Solitaire Ring presents an exquisite diamond set on an ultra-slim band of 18k solid gold. Perfect as an architectural engagement ring or a fine stacker.",
    materialOptions: ["#E5D5BC", "#B76E79"],
    sizeOptions: ["05", "06", "07", "08"],
    details: [
      "18k Solid Yellow Gold setting",
      "0.30ct Baguette Cut ethically-sourced diamond (E color, VS2)",
      "Ultra-thin 1.2mm delicate band for absolute modern style",
      "Made by local hand-casting specialists"
    ]
  },
  {
    id: "v-signature-bracelet",
    name: "V-Signature Bracelet",
    categoryName: "Bracelets",
    categoryId: "bracelets",
    price: 480,
    image: "images/v-signature-bracelet.jpg",
    secondaryImages: [
      "images/v-signature-bracelet.jpg"
    ],
    isNew: true,
    tagline: "\"The ultimate crossover between natural elements and signature luxury hardware.\"",
    description: "An elegant leather cord bracelet adorned with a prominent V-shaped solid gold clasp mechanism. Designed to represent artisanal heritage and modern taste.",
    materialOptions: ["#625E56", "#211B12"], // Brown Leather, Black Leather
    sizeOptions: ["One Size"],
    details: [
      "Full-grain braided Italian calfskin leather cord",
      "Solid brass clasp plated in heavy 18k gold",
      "Handcrafted in Florence workshops",
      "Fits wrist sizes up to 8.2 inches smoothly"
    ]
  },
  {
    id: "classic-chrono-gold",
    name: "Classic Chrono Gold",
    categoryName: "Timepieces",
    categoryId: "timepieces",
    price: 2100,
    image: "images/classic-chrono-gold.jpg",
    secondaryImages: [
      "images/classic-chrono-gold.jpg"
    ],
    tagline: "\"A minimalist timepiece celebrating quiet horology under soft light.\"",
    description: "Classic chronograph with a mocha genuine leather strap, dual-subdials, and brushed gold case profile. The timepiece of choice for discerning visionaries.",
    materialOptions: ["#625E56"],
    sizeOptions: ["40mm"],
    details: [
      "Premium Japanese quartz multi-dial movement",
      "Gold-plated premium alloy case with case-back engravings",
      "Italian mineral glass face plate",
      "Strap: hand-stitched cocoa-tanned leather"
    ]
  },
  {
    id: "hammered-gold-pendant",
    name: "Hammered Gold Pendant",
    categoryName: "Necklaces",
    categoryId: "necklaces",
    price: 620,
    image: "images/hammered-gold-pendant.jpg",
    secondaryImages: [
      "images/hammered-gold-pendant.jpg"
    ],
    tagline: "\"Organic shapes molded to capture beautiful shadows and soft light.\"",
    description: "Handcrafted square gold plaque pendant featuring our unique hand-hammered relief. No two plaques look identical under the light.",
    materialOptions: ["#E5D5BC"],
    sizeOptions: ["18\"", "20\""],
    details: [
      "18k Yellow Gold plating over solid sterling silver base",
      "Pendant dimensions: 12mm x 12mm",
      "Delicate high-tensile gold link chain",
      "Includes microfiber cleaning pouch and authentication card"
    ]
  },
  {
    id: "rose-gold-tbar",
    name: "Rose Gold T-Bar Bracelet",
    categoryName: "Bracelets",
    categoryId: "bracelets",
    price: 450,
    image: "images/rose-gold-tbar.jpg",
    secondaryImages: [
      "images/rose-gold-tbar.jpg"
    ],
    tagline: "\"Minimalist warmth in every link. Crafted with premium rose gold plating.\"",
    description: "The Rose Gold T-Bar Bracelet combines chunky modern link styling with the timeless grace of our circular toggle lock. Highly editorial.",
    materialOptions: ["#B76E79", "#E5D5BC"],
    sizeOptions: ["S", "M"],
    details: [
      "Premium 18k Rose Gold heavy layer on sterling silver",
      "Weight: ~8.2g",
      "Exclusive toggle closure styled to last",
      "Presented in luxury linen drawstring gift sack"
    ]
  },
  {
    id: "classic-heirloom-timepiece",
    name: "Classic Heirloom Timepiece",
    categoryName: "Timepieces",
    categoryId: "timepieces",
    price: 1200,
    image: "images/classic-heirloom-timepiece.jpg",
    secondaryImages: [
      "images/classic-heirloom-timepiece.jpg"
    ],
    tagline: "\"A masterclass in modern horology. Designed to be passed down through generations.\"",
    description: "Featuring a custom tan leather band and a pure matte-finish dial. The Classic Heirloom Watch matches structural precision with understated charm.",
    materialOptions: ["#E5D5BC"],
    sizeOptions: ["One Size"],
    details: [
      "38mm brushed alloy case",
      "Citizen Japanese quartz internal mechanism",
      "Water resistance up to 30 meters (3 ATM)",
      "Premium top-grain cowhide leather strap"
    ]
  },
  {
    id: "artisanal-textured-ring",
    name: "Artisanal Textured Ring",
    categoryName: "Rings",
    categoryId: "rings",
    price: 280,
    image: "images/artisanal-textured-ring.jpg",
    secondaryImages: [
      "images/artisanal-textured-ring.jpg"
    ],
    tagline: "\"Pure sterling silver sculpted by hand with a modern VERO emblem.\"",
    description: "Features custom engraved raw silver textures achieved through sand-casting. Hand-finished for a highly personal look.",
    materialOptions: ["#E5E4E2"],
    sizeOptions: ["06", "07", "08", "09"],
    details: [
      "Solid Sterling Silver 925 casting",
      "Embossed V logo detailing",
      "Comfort-fit chamfered inner edges",
      "Individually hand-oxidized and polished"
    ]
  },
  {
    id: "aurelian-link",
    name: "Aurelian Link",
    categoryName: "Necklaces",
    categoryId: "necklaces",
    price: 1800,
    image: "images/aurelian-link.jpg",
    secondaryImages: [
      "images/aurelian-link.jpg"
    ],
    tagline: "\"Fine link chain featuring solid gold geometric block beads.\"",
    description: "Part of our Aurelian series, this link necklace showcases exceptional modern block architecture paired with an extremely fine high-tensile gold link chain.",
    materialOptions: ["#E5D5BC"],
    sizeOptions: ["18\""],
    details: [
      "18k Solid Recycled Gold chain and block links",
      "Designed to perfectly pair with our Sculpted Aurelian Ring",
      "Invisible lock clasp for a flawless profile",
      "Total weight: ~6.2g"
    ]
  },
  {
    id: "textured-cuff",
    name: "Textured Cuff",
    categoryName: "Bracelets",
    categoryId: "bracelets",
    price: 3200,
    image: "images/textured-cuff.jpg",
    secondaryImages: [
      "images/textured-cuff.jpg"
    ],
    tagline: "\"Heavy golden architecture that gracefully embraces your wrist.\"",
    description: "Two high-end gold cuffs styled with subtle sand-carved grooves. Offers an elegant, weighted presence designed to make a quiet yet strong statement of taste.",
    materialOptions: ["#E5D5BC"],
    sizeOptions: ["Medium"],
    details: [
      "Casted in heavy premium 18k solid gold",
      "Dimensions: width 15mm, thickness 2.5mm",
      "Inner diameter: 60mm with standard flexible entry",
      "Crafted inside Florence high-artisan design houses"
    ]
  },
  {
    id: "vero-chronos",
    name: "Vero Chronos",
    categoryName: "Timepieces",
    categoryId: "timepieces",
    price: 5500,
    image: "images/vero-chronos.jpg",
    secondaryImages: [
      "images/vero-chronos.jpg"
    ],
    tagline: "\"The absolute summit of the VERO horological lineage. Mesh gold masterpiece.\"",
    description: "Vero Chronos features a mesh-knit gold-plated strap, a pure minimalist ivory dial face, and ultra-high-end sapphire glass casing. For the ultimate watch aficionado.",
    materialOptions: ["#E5D5BC"],
    sizeOptions: ["42mm"],
    details: [
      "Premium 21-jewel automatic mechanical movement",
      "42mm solid 18k gold-plated premium steel alloy casing",
      "Mesh-weave gold strap with secure micro-adjust lock",
      "Sapphire crystal face with double-layered anti-reflective finish"
    ]
  },
  {
    id: "trinity-stack",
    name: "Trinity Stack",
    categoryName: "Rings",
    categoryId: "rings",
    price: 950,
    image: "images/trinity-stack.jpg",
    secondaryImages: [
      "images/trinity-stack.jpg"
    ],
    tagline: "\"Three perfectly calculated gold stacking bands of varying textures.\"",
    description: "Elegance defined by multiple tiers. Trinity Stack features three separate 18k yellow gold bands of varied finishes: hammered, brushed, and diamond-paved.",
    materialOptions: ["#E5D5BC"],
    sizeOptions: ["05", "06", "07", "08", "09"],
    details: [
      "Set of three independent stackable gold bands",
      "Crafted in 18k solid recycled yellow gold",
      "Includes premium pavé set diamonds (0.15ctw)",
      "Designed for endless arrangement variations"
    ]
  }
];

export const STORIES = [
  {
    title: "Quiet Luxury Philosophy",
    quote: "Our brand stands for restraint. True elegance is felt in the details, not the loudness of marketing or massive logos. It's a dialogue between the piece and its owner.",
    image: "images/story-luxury.jpg"
  },
  {
    title: "Florence Heritage",
    quote: "Every VERO creation begins its life in Florence, Italy, forged by third-generation jewelry masters using lost-wax casting (cire perdue) paired with computer-aided precision engineering.",
    image: "images/sculpted-aurelian-ring-4.jpg"
  },
  {
    title: "Eco-Conscious Restraint",
    quote: "Details define you, and they define our world. 100% of our gold is recycled, and every single gemstone we source is certified conflict-free, ensuring beautiful jewelry that respects the future.",
    image: "images/story-eco.jpg"
  }
];

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Elena R.",
    rating: 5,
    date: "July 12, 2026",
    comment: "An absolute masterpiece. The texture of the ring catches light in a way I have never seen before. Truly embodies quiet luxury!"
  },
  {
    id: "rev-2",
    author: "Marcello D.",
    rating: 5,
    date: "June 28, 2026",
    comment: "Exquisite weight and hand-feel. It's clear that genuine artisan hours went into forging this piece. VERO has completely elevated my expectations."
  }
];
