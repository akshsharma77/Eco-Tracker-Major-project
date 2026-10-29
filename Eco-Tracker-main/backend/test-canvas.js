const { createCanvas } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'green';
ctx.fillRect(0, 0, 200, 200);
console.log('Canvas works! Data URL:', canvas.toDataURL().substring(0, 50));
