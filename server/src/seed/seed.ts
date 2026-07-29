import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { slugify, uniqueSlug } from '../utils/slug.js';

const categories = [
  { name: 'Pottery & Ceramics', description: 'Hand-thrown terracotta and clay craft from Bangladeshi potters.', imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600' },
  { name: 'Jute & Basketry', description: 'Eco-friendly jute bags, mats, and woven baskets.', imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600' },
  { name: 'Handloom Textiles', description: 'Nakshi kantha, jamdani-inspired scarves, and woven fabric.', imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600' },
  { name: 'Bamboo & Cane', description: 'Bamboo furniture, lamps, and home decor.', imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600' },
  { name: 'Brass & Metal Craft', description: 'Traditional brass utensils and decorative metalwork.', imageUrl: 'https://images.unsplash.com/photo-1589994160839-163cd867cfe8?w=600' },
  { name: 'Leather Goods', description: 'Handcrafted leather wallets, bags, and sandals.', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600' },
];

const sellers = [
  { name: 'Rina Akter', email: 'rina@deshicraft.local', shopName: 'Rina Terracotta Studio', region: 'Rajshahi', bio: 'Third-generation potter shaping clay from the banks of the Padma.' },
  { name: 'Kamal Hossain', email: 'kamal@deshicraft.local', shopName: 'Kamal Jute Works', region: 'Faridpur', bio: 'Sustainable jute products made by a village cooperative.' },
  { name: 'Nasrin Sultana', email: 'nasrin@deshicraft.local', shopName: 'Nokshi Threads', region: 'Jamalpur', bio: 'Hand-stitched nakshi kantha keeping a centuries-old tradition alive.' },
];

type SeedProduct = {
  title: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  material: string;
  region: string;
  tags: string[];
  images: string[];
  description: string;
  sellerEmail: string;
};

const products: SeedProduct[] = [
  {
    title: 'Hand-thrown Terracotta Water Pitcher',
    category: 'Pottery & Ceramics',
    price: 850, compareAtPrice: 1100, stock: 12,
    material: 'Terracotta clay', region: 'Rajshahi',
    tags: ['terracotta', 'kitchen', 'handmade'],
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800'],
    description: 'A traditional terracotta pitcher that keeps water naturally cool. Each piece is hand-thrown and sun-dried before a low-temperature firing.',
    sellerEmail: 'rina@deshicraft.local',
  },
  {
    title: 'Glazed Clay Dinner Bowl Set (4 pcs)',
    category: 'Pottery & Ceramics',
    price: 1450, stock: 8,
    material: 'Glazed ceramic', region: 'Rajshahi',
    tags: ['tableware', 'ceramic', 'gift'],
    images: ['https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'],
    description: 'A set of four rustic glazed bowls, perfect for serving rice, curry, or dessert. Food-safe glaze, dishwasher friendly.',
    sellerEmail: 'rina@deshicraft.local',
  },
  {
    title: 'Decorative Terracotta Wall Plate',
    category: 'Pottery & Ceramics',
    price: 1200, stock: 5,
    material: 'Terracotta clay', region: 'Rajshahi',
    tags: ['wall-art', 'decor'],
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'],
    description: 'Intricately carved wall plate depicting rural Bengali motifs. A statement piece for any living room.',
    sellerEmail: 'rina@deshicraft.local',
  },
  {
    title: 'Eco Jute Shopping Bag',
    category: 'Jute & Basketry',
    price: 450, compareAtPrice: 600, stock: 40,
    material: '100% natural jute', region: 'Faridpur',
    tags: ['jute', 'eco', 'bag'],
    images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800'],
    description: 'A sturdy, biodegradable jute tote that replaces dozens of plastic bags. Reinforced handles carry up to 10kg.',
    sellerEmail: 'kamal@deshicraft.local',
  },
  {
    title: 'Woven Jute Floor Mat',
    category: 'Jute & Basketry',
    price: 1650, stock: 15,
    material: 'Braided jute', region: 'Faridpur',
    tags: ['rug', 'home', 'eco'],
    images: ['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800'],
    description: 'A hand-braided round jute mat that adds warm, natural texture to any room. 90cm diameter.',
    sellerEmail: 'kamal@deshicraft.local',
  },
  {
    title: 'Jute Storage Basket with Handles',
    category: 'Jute & Basketry',
    price: 720, stock: 22,
    material: 'Jute and cotton', region: 'Faridpur',
    tags: ['storage', 'organizer'],
    images: ['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800'],
    description: 'Collapsible jute basket for toys, laundry, or plants. Soft cotton-lined interior.',
    sellerEmail: 'kamal@deshicraft.local',
  },
  {
    title: 'Nakshi Kantha Embroidered Throw',
    category: 'Handloom Textiles',
    price: 3800, compareAtPrice: 4500, stock: 6,
    material: 'Cotton with silk thread', region: 'Jamalpur',
    tags: ['kantha', 'blanket', 'heritage'],
    images: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800'],
    description: 'A hand-embroidered nakshi kantha throw, stitched over three months. Each motif tells a story of rural life.',
    sellerEmail: 'nasrin@deshicraft.local',
  },
  {
    title: 'Handloom Cotton Scarf',
    category: 'Handloom Textiles',
    price: 950, stock: 30,
    material: 'Handloom cotton', region: 'Jamalpur',
    tags: ['scarf', 'accessory', 'gift'],
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800'],
    description: 'Lightweight handwoven cotton scarf with a subtle jamdani-inspired border. Breathable and soft.',
    sellerEmail: 'nasrin@deshicraft.local',
  },
  {
    title: 'Embroidered Cushion Cover Pair',
    category: 'Handloom Textiles',
    price: 1300, stock: 18,
    material: 'Cotton', region: 'Jamalpur',
    tags: ['cushion', 'home', 'embroidery'],
    images: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800'],
    description: 'Two hand-embroidered cushion covers (16x16in) featuring traditional kantha stitching. Hidden zip closure.',
    sellerEmail: 'nasrin@deshicraft.local',
  },
  {
    title: 'Bamboo Table Lamp',
    category: 'Bamboo & Cane',
    price: 2100, stock: 9,
    material: 'Natural bamboo', region: 'Sylhet',
    tags: ['lamp', 'lighting', 'decor'],
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'],
    description: 'A warm, ambient bamboo lamp hand-cut with geometric openings that cast beautiful shadow patterns.',
    sellerEmail: 'kamal@deshicraft.local',
  },
  {
    title: 'Brass Diya Oil Lamp Set',
    category: 'Brass & Metal Craft',
    price: 1550, stock: 14,
    material: 'Cast brass', region: 'Dhaka',
    tags: ['brass', 'festival', 'decor'],
    images: ['https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?w=800'],
    description: 'A set of five polished brass diyas for festivals and daily prayer. Traditionally cast and finished by hand.',
    sellerEmail: 'rina@deshicraft.local',
  },
  {
    title: 'Handstitched Leather Wallet',
    category: 'Leather Goods',
    price: 1250, compareAtPrice: 1600, stock: 25,
    material: 'Full-grain leather', region: 'Dhaka',
    tags: ['wallet', 'leather', 'gift'],
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'],
    description: 'A slim, hand-stitched full-grain leather wallet that ages beautifully. Six card slots and two note compartments.',
    sellerEmail: 'kamal@deshicraft.local',
  },
];

async function run() {
  await connectDB();
  console.log('[seed] clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
  ]);

  console.log('[seed] creating admin...');
  const admin = await User.create({
    name: 'DeshiCraft Admin',
    email: env.seed.adminEmail,
    password: env.seed.adminPassword,
    role: 'admin',
  });

  console.log('[seed] creating customer...');
  const customer = await User.create({
    name: 'Ayesha Rahman',
    email: 'customer@deshicraft.local',
    password: 'Customer123!',
    role: 'customer',
    addresses: [
      {
        fullName: 'Ayesha Rahman',
        phone: '+8801712345678',
        street: '15 Green Road, Flat 4B',
        city: 'Dhaka',
        district: 'Dhaka',
        postalCode: '1205',
      },
    ],
  });

  console.log('[seed] creating sellers...');
  const sellerDocs = new Map<string, mongoose.Types.ObjectId>();
  for (const s of sellers) {
    const user = await User.create({
      name: s.name,
      email: s.email,
      password: 'Seller123!',
      role: 'seller',
      sellerProfile: { shopName: s.shopName, bio: s.bio, region: s.region, approved: true },
    });
    sellerDocs.set(s.email, user._id);
  }

  console.log('[seed] creating categories...');
  const categoryDocs = new Map<string, mongoose.Types.ObjectId>();
  for (const c of categories) {
    const doc = await Category.create({ ...c, slug: slugify(c.name) });
    categoryDocs.set(c.name, doc._id);
  }

  console.log('[seed] creating products...');
  const createdProducts = [];
  for (const p of products) {
    const doc = await Product.create({
      title: p.title,
      slug: uniqueSlug(p.title),
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      category: categoryDocs.get(p.category),
      seller: sellerDocs.get(p.sellerEmail),
      stock: p.stock,
      material: p.material,
      region: p.region,
      tags: p.tags,
    });
    createdProducts.push(doc);
  }

  console.log('[seed] creating a sample delivered order + review...');
  const firstProduct = createdProducts[0];
  await Order.create({
    orderNumber: 'DC-SEED-0001',
    user: customer._id,
    items: [
      {
        product: firstProduct._id,
        seller: firstProduct.seller,
        title: firstProduct.title,
        image: firstProduct.images[0],
        price: firstProduct.price,
        quantity: 1,
      },
    ],
    shippingAddress: customer.addresses[0],
    itemstotal: firstProduct.price,
    shippingfee: 60,
    total: firstProduct.price + 60,
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    status: 'delivered',
  });

  await Review.create({
    product: firstProduct._id,
    user: customer._id,
    rating: 5,
    comment: 'Beautiful craftsmanship and it really keeps the water cool. Highly recommend!',
  });

  console.log('\n[seed] done. Accounts:');
  console.log(`  admin    -> ${admin.email} / ${env.seed.adminPassword}`);
  console.log('  customer -> customer@deshicraft.local / Customer123!');
  console.log('  seller   -> rina@deshicraft.local / Seller123!');

  await disconnectDB();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed', err);
    process.exit(1);
  });
