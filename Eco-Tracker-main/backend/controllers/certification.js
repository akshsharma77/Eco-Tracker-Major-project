const User = require('../models/User');
const AcademyModule = require('../models/AcademyModule');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { generateBadge } = require('../utils/badgeGenerator');

// @desc    Download certification PDF
// @route   GET /api/certification/download
// @access  Private
exports.downloadCertificate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('academyProgress.moduleId');
    
    const totalModules = await AcademyModule.countDocuments() || 6;
    if (user.academyProgress.length < totalModules && user.subRole !== 'CERTIFIED_CITIZEN') {
      return res.status(400).json({ success: false, message: `Certification requires completion of all ${totalModules} modules.` });
    }

    const avgScore = user.academyProgress.length > 0 
      ? user.academyProgress.reduce((acc, curr) => acc + (curr.score || 80), 0) / user.academyProgress.length
      : 85;
    const certId = `ECO-${new Date().getFullYear()}-${uuidv4().split('-')[0].toUpperCase()}`;
    const date = new Date().toLocaleDateString();

    // 1. Generate Badge using Canvas safely
    let badgeBuffer = null;
    try {
      badgeBuffer = await generateBadge('ECO_EXPERT');
    } catch (e) {
      console.warn('Badge generation skipped:', e.message);
    }

    // 2. Create PDF
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=EcoTrack_Cert_${user.name.replace(/ /g, '_')}.pdf`);
    
    doc.pipe(res);

    // BACKGROUND & BORDER
    // Dark Emerald Outer Frame
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#020617');
    
    // Inner Light Frame
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).fill('#FFFFFF');
    
    // Emerald Border
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).lineWidth(1).stroke('#10B981');
    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).lineWidth(3).stroke('#064E3B');

    // HEADER
    doc.fillColor('#064E3B')
       .fontSize(50)
       .font('Helvetica-Bold')
       .text('EcoTrack', 0, 80, { align: 'center' });
    
    doc.fillColor('#10B981')
       .fontSize(14)
       .font('Helvetica')
       .text('DECENTRALIZED WASTE PROTOCOL - SUSTAINABILITY LEDGER', 0, 140, { align: 'center' });

    // MAIN BODY
    doc.fillColor('#64748B')
       .fontSize(22)
       .font('Helvetica')
       .text('CERTIFICATE OF ACHIEVEMENT', 0, 200, { align: 'center' });

    doc.fillColor('#94A3B8')
       .fontSize(14)
       .text('This record verifies that the participant has successfully demonstrated proficiency in', 0, 240, { align: 'center' });

    doc.fillColor('#064E3B')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text(user.name.toUpperCase(), 0, 280, { align: 'center' });

    doc.fillColor('#475569')
       .fontSize(16)
       .font('Helvetica')
       .text(`Completed the EcoAcademy Professional Series with a Cumulative Score of ${avgScore.toFixed(0)}%.`, 0, 340, { align: 'center' });
    
    // BADGE INTEGRATION
    if (badgeBuffer) {
      doc.image(badgeBuffer, doc.page.width / 2 - 60, 420, { width: 120 });
    }

    // FOOTER INFO
    doc.fillColor('#94A3B8')
       .fontSize(10)
       .font('Courier')
       .text(`BLOCKCHAIN IDENTITY: ${certId}`, 100, 520);
    doc.text(`VERIFIED AT: ${date}`, 100, 535);

    // QR Code
    try {
      const qrData = `https://ecotrack.ai/verify/${certId}`;
      const qrImage = await QRCode.toDataURL(qrData);
      doc.image(qrImage, doc.page.width - 160, 480, { width: 80 });
      
      doc.fontSize(7)
         .font('Helvetica')
         .text('SCAN TO VERIFY INTEGRITY', doc.page.width - 160, 565, { width: 80, align: 'center' });
    } catch (qrErr) {
      console.warn('QR generation skipped:', qrErr.message);
    }

    // SIGNATURE
    doc.moveTo(100, 480).lineTo(250, 480).lineWidth(1).stroke('#CBD5E1');
    doc.fillColor('#475569')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('OFFICIAL VALIDATION NODE', 100, 490);

    doc.end();

  } catch (err) {
    console.error('PDF Generation Error:', err);
    if (!res.headersSent) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};
