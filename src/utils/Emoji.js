// // utils/emojiUtils.js
// import emojiData from 'emoji-datasource/emoji.json';

// // Batch processing constants
// export const BATCH_SIZE = 24; // Number of emojis per batch
// const API_DELAY = 300; // Simulated API delay in ms

// export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
// export const REACTION_SIZE = 28;

// // Process emoji data into categories
// const processEmojiData = () => {
//   const categories = {};

//   emojiData.forEach(emoji => {
//     if (!emoji.category) return;
//     if (!categories[emoji.category]) {
//       categories[emoji.category] = [];
//     }
//     categories[emoji.category].push(emoji);
//   });

//   return categories;
// };

// // Process emoji data in batches
// export const getEmojiBatches = () => {
//   const batches = {};

//   Object.entries(processEmojiData()).forEach(([category, emojis]) => {
//     batches[category] = [];
//     for (let i = 0; i < emojis.length; i += BATCH_SIZE) {
//       batches[category].push(emojis.slice(i, i + BATCH_SIZE));
//     }
//   });

//   return batches;
// };

// // Simulate API fetch
// export const fetchEmojiBatch = async (category, batchIndex) => {
//   const batches = getEmojiBatches();

//   // Ensure the category exists and has batches
//   if (!batches[category] || !Array.isArray(batches[category])) {
//     return [];
//   }

//   return new Promise(resolve => {
//     setTimeout(() => {
//       // Ensure we don't try to access undefined batches
//       const batch = batches[category][batchIndex] || [];
//       resolve(batch);
//     }, API_DELAY);
//   });
// };

import emojiData from 'emoji-datasource/emoji.json';

// Get all emojis grouped by category
export const getEmojisByCategory = () => {
    const categories = {};

    emojiData.forEach(emoji => {
        if (!emoji.category) return;
        if (!categories[emoji.category]) {
            categories[emoji.category] = [];
        }
        categories[emoji.category].push({
            unified: emoji.unified,
            char: emoji.char || String.fromCodePoint(...emoji.unified.split('-').map(u => parseInt(u, 16))),
            name: emoji.name
        });
    });

    return categories;
};

// Find emoji by unified code
export const getEmojiByCode = (unifiedCode) => {
    return emojiData.find(emoji => emoji.unified === unifiedCode)?.char || '❓';
};