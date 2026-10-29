const { createCanvas } = require('canvas');

/**
 * Generates a high-quality circular badge for EcoTrack certificates.
 * @param {string} type - 'ECO_EXPERT' or 'VERIFIED_CITIZEN'
 * @returns {Buffer} - PNG buffer of the badge
 */
exports.generateBadge = async (type = 'ECO_EXPERT') => {
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');
  const centerX = 200;
  const centerY = 200;

  // 1. Draw Outer Gold Ring
  const outerGradient = ctx.createRadialGradient(centerX, centerY, 150, centerX, centerY, 200);
  outerGradient.addColorStop(0, '#D4AF37'); // Gold
  outerGradient.addColorStop(1, '#996515'); // Dark Gold
  ctx.fillStyle = outerGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 190, 0, Math.PI * 2);
  ctx.fill();

  // 2. Draw Inner Emerald Circle
  const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
  innerGradient.addColorStop(0, '#10B981'); // Emerald
  innerGradient.addColorStop(1, '#064E3B'); // Dark Emerald
  ctx.fillStyle = innerGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
  ctx.fill();

  // 3. Add Glossy Overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 160, -Math.PI / 4, Math.PI / 0.8);
  ctx.fill();

  // 4. Text - Achievement Title
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.font = 'bold 45px Helvetica';
  
  const text = type === 'ECO_EXPERT' ? 'ECO EXPERT' : 'VERIFIED';
  ctx.fillText(text, centerX, centerY + 15);

  if (type === 'ECO_EXPERT') {
    ctx.font = '18px Helvetica';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('PROTOCOL GRADUATE', centerX, centerY + 45);
  }

  // 5. Decorative Stars (Simple)
  ctx.fillStyle = '#FFD700';
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
    const x = centerX + Math.cos(angle) * 130;
    const y = centerY + Math.sin(angle) * 130;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
};
