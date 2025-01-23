require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const client = new Client();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const userId = '836264845669040177'; // Replace with the user ID
    const user = await client.users.fetch(userId);

    async function sendHi() {
        try {
            await user.send('hi');
            console.log(`Sent "hi" to ${user.tag}`);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    await sendHi();

    rl.on('line', async (input) => {
        if (input.trim().toLowerCase() === 'r') {
            console.log('Sending "hi" again.');
            await sendHi();
        }
    });
});

client.login(process.env.TOKEN);
