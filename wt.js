const axios = require('axios');

const getWitResponse = async (userMessage) => {
  try {
    const response = await axios.get('https://api.wit.ai/message', {
      params: {
        v: '20250522',
        q: userMessage
      },
      headers: {
        Authorization: 'Bearer SDNY2H47TEJRXVWXOQJB5FCNPAD54AZT'
      }
    });

    console.log(response.data);
  } catch (error) {
    console.error('Wit.ai Error:', error.response?.data || error.message);
  }
};

getWitResponse("Is back pain normal during pregnancy?");
