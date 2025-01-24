require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

const client = new Client();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const channelId = '1312765856945668217'; // Replace with your channel ID
    const channel = await client.channels.fetch(channelId);

    try {
        const messages = await channel.messages.fetch({ limit: 1 });
        const lastMessage = messages.first();
        if (lastMessage) {
            console.log(`Last message: ${lastMessage.content}`);
        } else {
            console.log('No messages found in the channel.');
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }

    client.destroy(); // Close the client after fetching the last message
});

client.login(process.env.TOKEN).catch(error => {
    console.error('Error logging in:', error);
});
