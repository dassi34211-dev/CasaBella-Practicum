// הרצה: node seed/products.seed.js
// טוען את המוצרים מהקובץ casabella.products.json (ייצוא מ-MongoDB Compass) אל המסד.
// בטוח להרצה חוזרת: מוצר שכבר קיים (לפי _id) מתעדכן ולא נוצר כפול.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Product } = require('../models/product.model');

// EJSON יודע לקרוא את הפורמט של Compass (למשל {"$oid": "..."} ו-{"$date": "..."})
const { EJSON } = mongoose.mongo.BSON || require('bson');

const FILE = path.join(__dirname, '..', 'casabella.products.json');

const readProducts = () => {
    const raw = fs.readFileSync(FILE, 'utf8').trim();
    let docs;
    try {
        docs = EJSON.parse(raw); // מערך אחד של מוצרים
    } catch {
        // או מוצר בכל שורה
        docs = raw.split(/\r?\n/).filter(Boolean).map((line) => EJSON.parse(line));
    }
    return Array.isArray(docs) ? docs : [docs];
};

const run = async () => {
    if (!fs.existsSync(FILE)) throw new Error(`File not found: ${FILE}`);
    const docs = readProducts();

    await mongoose.connect(process.env.MONGO_URI);
    await Product.collection.bulkWrite(
        docs.map((doc) => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } }))
    );

    console.log(`✅ ${docs.length} products loaded`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error('❌ Products seed failed:', err.message);
    process.exit(1);
});