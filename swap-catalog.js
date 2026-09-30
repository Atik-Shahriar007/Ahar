/* Shared demo catalogue: illustrative shopping alternatives, not nutrition equivalents. */
(function (root) {
  const catalog = [
    {
      id: 'rice', source: { en: 'Rice', bn: 'চাল' },
      options: [
        { id: 'flour', en: 'Flour (roti)', bn: 'আটা (রুটি)', qtyPerPersonDay: 0.3, unit: 'kg', pricePerUnit: 65, mealTags: ['roti-meal'] },
      ],
    },
    {
      id: 'eggs', source: { en: 'Eggs', bn: 'ডিম' },
      options: [
        { id: 'masoor-dal', en: 'Masoor dal', bn: 'মসুর ডাল', qtyPerPersonDay: 0.08, unit: 'kg', pricePerUnit: 150, mealTags: ['one-pot', 'rice-meal'] },
        { id: 'rui-fish', en: 'Rui fish', bn: 'রুই মাছ', qtyPerPersonDay: 0.15, unit: 'kg', pricePerUnit: 300, mealTags: ['rice-meal'] },
      ],
    },
    {
      id: 'masoor-dal', source: { en: 'Masoor dal', bn: 'মসুর ডাল' },
      options: [
        { id: 'eggs', en: 'Eggs', bn: 'ডিম', qtyPerPersonDay: 2, unit: 'pcs', pricePerUnit: 13, mealTags: ['one-pot', 'rice-meal'] },
        { id: 'rui-fish', en: 'Rui fish', bn: 'রুই মাছ', qtyPerPersonDay: 0.15, unit: 'kg', pricePerUnit: 300, mealTags: ['rice-meal'] },
      ],
    },
    {
      id: 'seasonal-vegetables', source: { en: 'Seasonal vegetables', bn: 'মৌসুমি সবজি' },
      options: [
        { id: 'leafy-greens', en: 'Leafy greens', bn: 'শাক', qtyPerPersonDay: 0.3, unit: 'kg', pricePerUnit: 80, mealTags: ['one-pot', 'rice-meal', 'roti-meal'] },
      ],
    },
    {
      id: 'cooking-oil', source: { en: 'Cooking oil', bn: 'রান্নার তেল' },
      options: [
        { id: 'mustard-oil', en: 'Mustard oil', bn: 'সরিষার তেল', qtyPerPersonDay: 0.025, unit: 'L', pricePerUnit: 200, mealTags: ['one-pot', 'rice-meal', 'roti-meal'] },
      ],
    },
    {
      id: 'rui-fish', source: { en: 'Rui fish', bn: 'রুই মাছ' },
      options: [
        { id: 'masoor-dal', en: 'Masoor dal', bn: 'মসুর ডাল', qtyPerPersonDay: 0.15, unit: 'kg', pricePerUnit: 150, mealTags: ['one-pot', 'rice-meal'] },
        { id: 'eggs', en: 'Eggs', bn: 'ডিম', qtyPerPersonDay: 2, unit: 'pcs', pricePerUnit: 13, mealTags: ['one-pot', 'rice-meal'] },
      ],
    },
  ];
  const goals = [
    { id: 'budget', en: 'Keep the sample cost low', bn: 'নমুনা খরচ কম রাখুন' },
    { id: 'pantry', en: 'Use confirmed pantry stock', bn: 'ঘরের নিশ্চিত মজুত ব্যবহার করুন' },
    { id: 'one-pot', en: 'Prefer the one-pot meal idea', bn: 'এক হাঁড়ির খাবার বেছে নিন' },
    { id: 'rice-meal', en: 'Prefer a rice-based meal idea', bn: 'ভাতের খাবারের ধারণা বেছে নিন' },
    { id: 'roti-meal', en: 'Prefer a roti-style meal idea', bn: 'রুটির খাবারের ধারণা বেছে নিন' },
  ];
  root.AHAR_SWAP_CATALOG = catalog;
  root.AHAR_SWAP_GOALS = goals;
  if (typeof module !== 'undefined' && module.exports) module.exports = { groups: catalog, goals };
})(typeof globalThis !== 'undefined' ? globalThis : this);
