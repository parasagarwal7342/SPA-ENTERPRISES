import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'db.json');

// Initial Registry Schema for SPA ENTERPRISE
const INITIAL_SCHEMA = {
  products: [
    {
      id: "1",
      brand: "National Geographic",
      name: "NG Stream Hardshell Trolley (L)",
      description: "Heavy-duty polycarbonate distribution asset for global expeditions.",
      features: ["TSA Authorized Protocol", "Impact-Reinforced Frame", "Global Logistics Mobility"],
      image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=1000",
      category: "Premium Distribution",
      price: "₹14,499"
    },
    {
        id: "2",
        brand: "Shraddha",
        name: "Artisanal Heritage Brass Necklace",
        description: "Handcrafted sovereign jewelry with 24K gold-plate consensus.",
        features: ["Certified Coating Authenticity", "Heritage Craft Node", "Elite Finish"],
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000",
        category: "Luxury Heritage",
        price: "₹4,899"
    }
  ],
  orders: [],
  meta: {
     last_sync: new Date().toISOString(),
     node: "DELHI-HQ-PRIMUS"
  }
};

export class Database {
    private static instance: Database;
    private data: any = null;

    private constructor() {}

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async init() {
        try {
            const content = await fs.readFile(DB_PATH, 'utf-8');
            this.data = JSON.parse(content);
            console.log("Sovereign Database: Sync Successful.");
        } catch (error) {
            console.log("Sovereign Database: Initializing Fresh Registry Protocol.");
            this.data = INITIAL_SCHEMA;
            await this.save();
        }
    }

    async save() {
        await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2));
    }

    // High-Performance Query Nodes
    getProducts() {
        return this.data.products;
    }

    async addProduct(product: any) {
        this.data.products.push(product);
        await this.save();
        return product;
    }

    async updateProduct(product: any) {
        const index = this.data.products.findIndex((p: any) => p.id === product.id);
        if (index !== -1) {
            this.data.products[index] = product;
            await this.save();
            return product;
        }
        throw new Error("Asset ID not found in registry.");
    }

    async removeProduct(id: string) {
        this.data.products = this.data.products.filter((p: any) => p.id !== id);
        await this.save();
    }
}
