/* Fixed demonstration food list for text parsing; not a nutrition database. */
(function (root) {
  const foods = [
    { id: 'rice', en: 'Rice', bn: 'ভাত / চাল', aliases: ['cooked rice', 'rice', 'ভাত', 'চাল'], units: ['cup', 'plate', 'g', 'kg'] },
    { id: 'dal-unspecified', en: 'Dal (type unspecified)', bn: 'ডাল (ধরন উল্লেখ নেই)', aliases: ['dal', 'lentils', 'ডাল'], units: ['cup', 'bowl', 'g', 'kg'] },
    { id: 'masoor-dal', en: 'Masoor dal', bn: 'মসুর ডাল', aliases: ['masoor dal', 'red lentils', 'মসুর ডাল', 'মসুর'], units: ['cup', 'bowl', 'g', 'kg'] },
    { id: 'fish-unspecified', en: 'Fish (type unspecified)', bn: 'মাছ (ধরন উল্লেখ নেই)', aliases: ['fish', 'মাছ'], units: ['piece', 'g', 'kg'] },
    { id: 'rui-fish', en: 'Rui fish', bn: 'রুই মাছ', aliases: ['rui fish', 'rohu', 'rui', 'রুই মাছ', 'রুই'], units: ['piece', 'g', 'kg'] },
    { id: 'eggs', en: 'Eggs', bn: 'ডিম', aliases: ['eggs', 'egg', 'ডিম'], units: ['piece'] },
    { id: 'seasonal-vegetables', en: 'Vegetables (type unspecified)', bn: 'সবজি (ধরন উল্লেখ নেই)', aliases: ['vegetables', 'veggies', 'সবজি'], units: ['cup', 'bowl', 'g', 'kg'] },
    { id: 'leafy-greens', en: 'Leafy greens', bn: 'শাক', aliases: ['leafy greens', 'greens', 'শাক'], units: ['cup', 'bowl', 'g', 'kg'] },
    { id: 'chicken', en: 'Chicken', bn: 'মুরগি', aliases: ['chicken', 'মুরগি', 'মুরগীর মাংস'], units: ['piece', 'g', 'kg'] },
    { id: 'flatbread', en: 'Roti / flatbread', bn: 'রুটি', aliases: ['flatbread', 'roti', 'রুটি'], units: ['piece'] },
    { id: 'flour', en: 'Flour', bn: 'আটা', aliases: ['wheat flour', 'flour', 'আটা'], units: ['g', 'kg'] },
    { id: 'cooking-oil', en: 'Cooking oil (type unspecified)', bn: 'রান্নার তেল (ধরন উল্লেখ নেই)', aliases: ['cooking oil', 'রান্নার তেল'], units: ['tsp', 'tbsp', 'ml', 'L'] },
    { id: 'mustard-oil', en: 'Mustard oil', bn: 'সরিষার তেল', aliases: ['mustard oil', 'সরিষার তেল'], units: ['tsp', 'tbsp', 'ml', 'L'] },
    { id: 'chickpeas', en: 'Chickpeas', bn: 'ছোলা', aliases: ['chickpeas', 'chickpea', 'ছোলা'], units: ['cup', 'bowl', 'g', 'kg'] },
    { id: 'cucumber', en: 'Cucumber', bn: 'শসা', aliases: ['cucumber', 'শসা'], units: ['piece', 'g', 'kg'] },
    { id: 'potatoes', en: 'Potato', bn: 'আলু', aliases: ['potatoes', 'potato', 'আলু'], units: ['piece', 'g', 'kg'] },
    { id: 'fries', en: 'Fries', bn: 'ফ্রাই', aliases: ['fries', 'ফ্রাই'], units: ['cup', 'g'] },
  ];
  root.AHAR_MEAL_FOODS = foods;
  if (typeof module !== 'undefined' && module.exports) module.exports = foods;
})(typeof globalThis !== 'undefined' ? globalThis : this);
