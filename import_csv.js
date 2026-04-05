
import fs from 'fs';
import path from 'path';

const csvPath = 'e:/spa/S_listing--ui--group_1c89db176ff449f0_0602-220002_default.csv';
const content = fs.readFileSync(csvPath, 'utf8');

const lines = content.split('\n');
const headers = lines[0].split(',');

const products = [];

// Skip headers and first two descriptive lines
for (let i = 3; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Handle commas inside quotes
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);

  const title = parts[0];
  const sku = parts[1];
  const category = parts[3];
  const mrp = parts[8];
  const price = parts[10];

  let brand = 'Shraddha';
  if (title.toUpperCase().includes('NATIONAL GEOGRAPHIC') || title.toUpperCase().includes('NAT GEO')) {
    brand = 'National Geographic';
  }

  // Pick a thematic image based on category
  let image = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800'; // Default
  const catLower = category.toLowerCase();
  const titleLower = title.toLowerCase();

  if (titleLower.includes('suit') || catLower.includes('suitcase') || titleLower.includes('suitcase')) {
    image = 'https://images.unsplash.com/photo-1111622352841-865611326442?q=80&w=800';
  } else if (titleLower.includes('sling') || catLower.includes('sling_bag')) {
    image = 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800';
  } else if (titleLower.includes('backpack') || catLower.includes('backpack')) {
    image = 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?q=80&w=800';
  } else if (titleLower.includes('waist') || catLower.includes('waist_bag')) {
    image = 'https://images.unsplash.com/photo-1598533023411-ca4e1d204f3d?q=80&w=800';
  } else if (titleLower.includes('bracelet') || catLower.includes('bracelet')) {
    image = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800';
  } else if (titleLower.includes('kada') || titleLower.includes('bangle')) {
    image = 'https://images.unsplash.com/photo-1611085583191-a3b1a6a9344e?q=80&w=800';
  } else if (titleLower.includes('chain') || catLower.includes('necklace')) {
    image = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800';
  }

  // Technical Specifications & Descriptions based on global NG/CAT catalogs
  let finalDesc = '';
  let finalFeatures = [
    `SKU: ${sku}`,
    `Brand: ${brand}`,
    'Official Quality Distribution'
  ];
  let finalImage = image;

  const titleUpper = title.toUpperCase();

  // Logic for Ocean RPET Collection (N20901, N20902, N20903, N20906)
  if (titleUpper.includes('OCEAN RPET')) {
    let liters = '';
    let recycleCount = '';
    if (titleUpper.includes('WAIST')) {
      liters = '2L'; recycleCount = '3.5';
      finalFeatures.push('RFID Protection', 'Padded Fleece Phone Pocket', 'Adjustable Waist Belt');
    } else if (titleUpper.includes('UTILITY')) {
      liters = '2.2L'; recycleCount = '3.1';
      finalFeatures.push('Dual Zip Compartments', 'RFID Shield Pocket', 'Built-in Key Holder');
    } else if (titleUpper.includes('MESSENGER') || titleUpper.includes('CROSSBODY')) {
      liters = '6.5L'; recycleCount = '6';
      finalFeatures.push('Adjustable Shoulder Strap', 'Internal Mesh Organizer', 'Luggage Tag Slot');
    } else if (titleUpper.includes('BACKPACK')) {
      liters = '24L'; recycleCount = '15.2';
      finalFeatures.push('3-Way Carry System', '15.6" Laptop Compartment', 'Trolley Handle Sleeve');
    }
    finalDesc = `${title.replace(' ()', '')}. Part of the sustainability-focused Ocean RPET collection. Crafted from recycled plastic bottles (${recycleCount} bottles repurposed). Features RFID-blocking technology for digital security. Dimensions optimized for travel efficiency. Capacity: ${liters}.`;
  }
  // Logic for Canyon Collection (N114HA)
  else if (titleUpper.includes('CANYON')) {
    let size = titleUpper.includes('28 INCH') ? '28" (Large)' : titleUpper.includes('24 INCH') ? '24" (Medium)' : '20" (Cabin)';
    finalFeatures.push('PC-ABS Impact Material', 'TSA Recessed Lock', '360° Double Spinner Wheels', 'Anti-Theft Zippers');
    finalDesc = `National Geographic Canyon ${size} Expandable Suitcase. Engineered with impact-resistant PC-ABS shells. Features Japanese-designed 8-wheel system for silent, smooth traction. Integrated TSA lock for global security. Fully lined interior with U-shaped divider and specialized compartments.`;
  }
  // Logic for Legend Collection (N19180)
  else if (titleUpper.includes('NG LEGEND')) {
    finalFeatures.push('Taslon Durable Fabric', 'Internal Padded Tablet Sleeve', 'Dual Top Carry Handles', '15L Capacity');
    finalDesc = `The Legend Series Backpack combines vintage explorer aesthetics with modern functionality. Made from high-density Taslon fabric. Classified internal organizers and refined metal hardware. Weight: 0.75kg. Ideal for daily urban transit and light trekking.`;
  }
  // Logic for Caterpillar (84027)
  else if (titleUpper.includes('CATERPILLAR')) {
    finalFeatures.push('600D Heavy Duty Polyester', 'EVA Protective Front Panel', '16" Padded Laptop Sleeve', '19L Work Capacity');
    finalDesc = `Caterpillar B. Holt 19L Professional Backpack. Built for the toughest jobsites and business travel. Features a reinforced EVA front panel for gadget protection and an ergonomic air-mesh back system. Includes a hidden "secret" pocket for valuables.`;
  }
  // Logic for Jewelry (Shraddha)
  else if (brand === 'Shraddha') {
    const itemType = titleUpper.includes('KADA') ? 'Kada' : titleUpper.includes('BRA') ? 'Bracelet' : 'Chain';
    finalFeatures.push('Authentic Brass Foundation', '1-Year Coating Warranty', 'Artisanal Hand-Finish', 'Skin-Friendly Alloy');
    finalDesc = `Luxurious ${itemType} by Shraddha. Handcrafted by master artisans celebrating traditional Indian jewelry patterns. Features a premium long-lasting gold-tinted coating with a 1-year warranty. Foundation material: Solid Jewelry-Grade Brass. Designed for daily elegance and spiritual resonance.`;
  } else {
    finalDesc = `${title.replace(' ()', '')}. SKU: ${sku}. Official ${brand} premium merchandise. Distributed by SPA Enterprise. High-quality materials and craftsmanship.`;
  }

  products.push({
    id: sku || `product-${i}`,
    brand: brand,
    name: title.replace(' ()', ''),
    description: finalDesc,
    features: finalFeatures,
    image: image,
    images: [],
    category: category.replace(/_/g, ' ').toUpperCase(),
    price: `₹ ${price}`,
    mrp: `₹ ${mrp}`
  });
}

const output = `
import { Brand, Product } from './types';

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2).replace(/"brand": "National Geographic"/g, '"brand": Brand.NationalGeographic').replace(/"brand": "Shraddha"/g, '"brand": Brand.Shraddha')};

export const BRAND_DETAILS = {
  [Brand.NationalGeographic]: {
    tagline: 'Further Your Adventure',
    description: 'National Geographic gear is engineered for durability and purpose. Inspired by the explorers who push boundaries.',
    colors: {
      primary: 'bg-[#FFCC00]',
      secondary: 'bg-[#2B2B2B]',
      accent: 'text-[#FFCC00]'
    }
  },
  [Brand.Shraddha]: {
    tagline: 'Tradition in Every Detail',
    description: 'Shraddha celebrates the timeless beauty of Indian brass craftsmanship. Our pieces are designed for longevity and spiritual resonance.',
    colors: {
      primary: 'bg-[#D4AF37]',
      secondary: 'bg-white',
      accent: 'text-[#D4AF37]'
    }
  }
};
`;

fs.writeFileSync('e:/spa/constants.tsx', output);
console.log(`Imported ${products.length} products to constants.tsx`);
