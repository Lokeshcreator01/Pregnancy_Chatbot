require('dotenv').config({ path: './Chatbotapi.env' });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const WIT_AI_TOKEN = process.env.WIT_AI_TOKEN;

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const witResponse = await axios.get('https://api.wit.ai/message', {
      headers: {
        Authorization: `Bearer ${WIT_AI_TOKEN}`,
      },
      params: {
        v: '20250522',
        q: message,
      },
    });

    const entities = witResponse.data.entities;
    const intent = witResponse.data.intents?.[0]?.name || 'unknown';

    const symptom = entities['symptom:symptom']?.[0]?.value;
    const stage =
      entities['pregnancy_stage:pregnancy_stage']?.[0]?.value ||
      entities['trimester:trimester']?.[0]?.value;
    const food = entities['food:food']?.[0]?.value;
    const medicine = entities['medicine:medicine']?.[0]?.value;
    const activity = entities['activity:activity']?.[0]?.value;
    const nutrient = entities['nutrient:nutrient']?.[0]?.value;
    const meal = entities['meal:meal']?.[0]?.value;

    let reply = "I'm not sure how to answer that. Could you rephrase?";

    if (intent === 'ask_pregnancy_symptoms' && symptom) {
      reply = `Yes, ${symptom} is commonly reported during pregnancy. However, if it's severe or persistent, consult your doctor.`;
    } else if (intent === 'ask_pregnancy_diet') {
      if (stage) {
        reply = `During the ${stage}, it’s important to eat a balanced diet rich in proteins, calcium, and iron.`;
      } else if (nutrient) {
        reply = `Great question! Foods rich in ${nutrient} include spinach, lentils, red meat, and fortified cereals.`;
      } else if (meal) {
        reply = `A healthy ${meal} during pregnancy could include whole grains, fruits, dairy, and a protein source.`;
      } else if (food) {
        reply = `Generally, ${food} is considered safe in moderation during pregnancy. It's best to ask your doctor for personalized advice.`;
      } else {
        reply = 'You should focus on fresh fruits, vegetables, lean proteins, and whole grains.';
      }
    } else if (intent === 'ask_food_safety') {
      reply = `${food} should be consumed with caution during pregnancy. It's best to avoid undercooked or unpasteurized options.`;
    } else if (intent === 'ask_medicine_safety' && medicine) {
      reply = `Please consult your doctor before taking ${medicine} during pregnancy.`;
    } else if (intent === 'ask_activity_safety' && activity) {
      reply = `Engaging in ${activity} may not be recommended during pregnancy. Please check with a healthcare provider.`;
    } else if (intent === 'ask_pregnancy_avoid') {
      reply = `During Pregnancy Period Taking ${medicine} affects the baby.`;
    }

    res.json({ reply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to connect to Wit.ai' });
  }
});

// Serve static React build files
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Chatbot backend running on port ${PORT}`);
});
