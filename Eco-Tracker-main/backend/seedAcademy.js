const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AcademyModule = require('./models/AcademyModule');

dotenv.config();

const modules = [
  {
    order: 1,
    title: 'Waste Management Awareness',
    description: 'Basics of waste, types, and importance of cleanliness.',
    category: 'WASTE_SEGREGATION',
    content: '## Understanding Waste\n\nWaste is anything that is no longer useful but can be managed or repurposed. Biodegradable waste (like food) decomposes naturally, while non-biodegradable waste (like plastic) does not.\n\n### Government Initiatives\nPrograms like "Swachh Bharat" aim to make our cities cleaner through collective action.',
    duration: '5 mins',
    xpReward: 100,
    creditsReward: 50,
    quizQuestions: [
      {
        question: 'What is biodegradable waste?',
        options: ['Material that never breaks down', 'Material that decomposes naturally', 'Electronic waste', 'Plastic bottles'],
        correctAnswer: 1
      },
      {
        question: 'Which waste decomposes naturally?',
        options: ['Food scraps', 'Styrofoam', 'Metal cans', 'Glass shards'],
        correctAnswer: 0
      }
    ]
  },
  {
    order: 2,
    title: 'Waste Segregation Techniques',
    description: 'Dry vs Wet waste, color-coded bins, and household methods.',
    category: 'WASTE_SEGREGATION',
    content: '## Segregation at Source\n\nSegregation is the most important step in waste management.\n- **Green Bin**: Wet waste (Food scraps, peels)\n- **Blue Bin**: Dry waste (Plastic, Paper, Metal)\n- **Red Bin**: Domestic hazardous waste (Diapers, Napkins)',
    duration: '10 mins',
    xpReward: 150,
    creditsReward: 75,
    quizQuestions: [
      {
        question: 'Where should plastic go?',
        options: ['Green Bin', 'Blue Bin', 'Red Bin', 'Black Bin'],
        correctAnswer: 1
      },
      {
        question: 'What bin is used for organic waste?',
        options: ['Blue', 'Red', 'Green', 'Yellow'],
        correctAnswer: 2
      }
    ]
  },
  {
    order: 3,
    title: 'Recycling & Reuse',
    description: 'Recycling process, benefits of reuse, and common materials.',
    category: 'RECYCLING_PRO',
    content: '## The 3 Rs\n\n1. **Reduce**: Consume less.\n2. **Reuse**: Find new purposes for old items.\n3. **Recycle**: Reprocess materials into new products.\n\nBenefits include saving energy and reducing landfill pressure.',
    duration: '8 mins',
    xpReward: 150,
    creditsReward: 75,
    quizQuestions: [
      {
        question: 'Which is a common recyclable material?',
        options: ['Food waste', 'Aluminum cans', 'Dirty tissues', 'Light bulbs'],
        correctAnswer: 1
      }
    ]
  },
  {
    order: 4,
    title: 'Smart Waste Reporting',
    description: 'How to upload complaints, geo-tagging importance, and AI verification.',
    category: 'ECO_LIFESTYLE',
    content: '## Using EcoTrack\n\nEcoTrack allows you to report waste by snapping a photo. \n- **Geo-tagging**: Automatically tags your location for workers.\n- **AI Verification**: Categorizes the waste type automatically.',
    duration: '7 mins',
    xpReward: 200,
    creditsReward: 100,
    quizQuestions: [
      {
        question: 'Why is geo-tagging important?',
        options: ['To share on social media', 'To help workers find the waste', 'To increase photo filter quality', 'To check the weather'],
        correctAnswer: 1
      }
    ]
  },
  {
    order: 5,
    title: 'Environmental Responsibility',
    description: 'Individual role in sustainability and reducing carbon footprint.',
    category: 'ECO_LIFESTYLE',
    content: '## Sustainability\n\nYour individual actions matter. By using EcoTrack and segregating waste, you reduce your personal carbon footprint and contribute to a healthier community.',
    duration: '10 mins',
    xpReward: 200,
    creditsReward: 100,
    quizQuestions: [
       {
         question: 'Which action helps reduce carbon footprint?',
         options: ['Using more plastic', 'Walking or cycling', 'Burning waste', 'Buying more electronics'],
         correctAnswer: 1
       }
    ]
  },
  {
    order: 6,
    title: 'Advanced Eco Practices',
    description: 'Composting, E-waste handling, and smart city waste systems.',
    category: 'HAZARDOUS_HANDLING',
    content: '## Beyond the Basics\n\n- **Composting**: Turning organic waste into fertilizer.\n- **E-Waste**: Special handling for batteries and circuit boards.\n- **Smart Cities**: Using IoT sensors in bins to optimize collection routes.',
    duration: '12 mins',
    xpReward: 300,
    creditsReward: 150,
    quizQuestions: [
      {
        question: 'What is composting?',
        options: ['Burning plastic', 'Turning organics into fertilizer', 'Dumping in oceans', 'Recycling electronics'],
        correctAnswer: 1
      }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    await AcademyModule.deleteMany();
    console.log('Existing modules cleared.');

    await AcademyModule.insertMany(modules);
    console.log('6 Core Academy Modules with Quizes seeded!');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
