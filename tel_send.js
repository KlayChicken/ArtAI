const axios = require('axios');

const sendMessage = async (msg) => {
    try {
        const url = `https://api.telegram.org/_/sendMessage`

        await axios.post(url, { chat_id: , text: msg })
    } catch (err) {
        console.error(err)
    }
}

module.exports = sendMessage;