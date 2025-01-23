require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const client = new Client();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const channelId = '1312765856945668217'; // Replace with your channel ID
    const channel = await client.channels.fetch(channelId);
    const messagesToSend = ['owo hunt']; // Predefined list of messages
    const maxCycles = 40; // Predefined number of times the messages should be sent
    const terminationText = "a​re y​ou a​ r​eal huma​n?"; // Predefined termination text
    let cycleCount = 0;
    let messageIndex = 0;
    let isRunning = true;

    async function checkAndSendMessage() {
        if (!isRunning) return;

        if (cycleCount >= maxCycles) {
            console.log('Reached maximum cycle count. Stopping the bot.');
            return;
        }

        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            const lastMessage = messages.first();
            if (lastMessage && lastMessage.content.includes(terminationText)) {
                console.log(`Last message contains "${terminationText}". Stopping the bot.`);
                return;
            }

            await channel.send(messagesToSend[messageIndex]);
            console.log(`Sent message: ${messagesToSend[messageIndex]}`);
            cycleCount++;
            console.log(`Cycle count: ${cycleCount}`);
            messageIndex = (messageIndex + 1) % messagesToSend.length;

            // Wait for a random time between 11-15 seconds before sending the next message
            const randomDelay = Math.floor(Math.random() * (15000 - 11000 + 1)) + 10000;
            setTimeout(checkAndSendMessage, randomDelay);
        } catch (error) {
            console.error('Error fetching messages or sending message:', error);
        }
    }

    rl.on('line', (input) => {
        if (input.trim().toLowerCase() === 'r') {
            console.log('Restarting the cycle.');
            cycleCount = 0;
            messageIndex = 0;
            isRunning = true;
            checkAndSendMessage();
        }
    });

    checkAndSendMessage();
});

client.login(process.env.TOKEN);
