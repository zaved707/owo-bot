require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');

const client = new Client();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let maxCycles = 34; // Predefined number of times the messages should be sent
let cycleCount = 0;
let messageIndex = 0;
let isRunning = true;
let currentTimeout;

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const channelId = process.env.CHANNEL_ID; // Take channel ID from .env file
    const channel = await client.channels.fetch(channelId);
    const messagesToSend = ['owo hunt', 'owo battle']; // Predefined list of messages
    const terminationTexts = [
        "stop","captcha",
        "real human",
    ]; // Define multiple termination texts
    const botTerminatedMessage = 'bot terminated'; // Define the 'bot terminated' text once
    const botCompletedMessage = 'bot completed all messages'; // Define the 'bot completed' text once

    // Variable to define how many times the loop runs before sending random commands
    const randomCommandInterval = 40;

    // List of random commands to be executed after every randomCommandInterval revolutions
    const randomCommands = ['owo inv', 'owo ah', 'owo cash', 'owo lvl', 'owo zoo'];

    const userId = '836264845669040177'; // Replace with the user ID
    const user = await client.users.fetch(userId);

    async function sendMessageToUser(message) {
        try {
            await user.send(message);
            console.log(`Sent "${message}" to ${user.tag}`);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    async function handleBotTermination() {
        const endTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        async function sendMessagesPeriodically() {
            if (isRunning || Date.now() >= endTime) return;

            await sendMessageToUser(botTerminatedMessage);
            const randomDelay = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
            setTimeout(sendMessagesPeriodically, randomDelay);
        }

        sendMessagesPeriodically();
    }

    async function handleBotCompletion() {
        await sendMessageToUser(botCompletedMessage);
        isRunning = false; // Change isRunning to false after the bot finishes
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function containsTerminationText(message) {
        const cleanedMessage = message.replace(/\u200B/g, ''); // Remove zero-width space characters
        console.log(`Cleaned message: ${cleanedMessage}`);
        return terminationTexts.some(text => cleanedMessage.toLowerCase().includes(text.toLowerCase()));
    }

    async function executeRandomCommands() {
        shuffleArray(randomCommands);
        const commandsToExecute = randomCommands.slice(0, 2); // Select only 2 random commands
        for (const command of commandsToExecute) {
            const messages = await channel.messages.fetch({ limit: 1 });
            const lastMessage = messages.first();
            if (lastMessage) {
                //console.log(`Last message: ${lastMessage.content}`);
                if (containsTerminationText(lastMessage.content)) {
                    console.log(`Last message contains termination text. Stopping the bot.`);
                    isRunning = false;
                    await handleBotTermination();
                    return;
                }
            }

            await channel.send(command);
            console.log(`Executed random command: ${command}`);
            const randomDelay = Math.floor(Math.random() * (40000 - 30000 + 1)) + 30000;
            await new Promise(resolve => setTimeout(resolve, randomDelay));
        }
    }

    async function checkAndSendMessage() {
        if (!isRunning) return;

        if (cycleCount >= maxCycles) {
            console.log('Reached maximum cycle count. Stopping the bot.');
            await handleBotCompletion();
            return;
        }

        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            const lastMessage = messages.first();
            if (lastMessage) {
                //console.log(`Last message: ${lastMessage.content}`);
                if (containsTerminationText(lastMessage.content)) {
                    console.log(`Last message contains termination text. Stopping the bot.`);
                    isRunning = false;
                    await handleBotTermination();
                    return;
                }
            }

            await channel.send(messagesToSend[messageIndex]);
            console.log(`Sent message: ${messagesToSend[messageIndex]}`);
            cycleCount++;
            console.log(`Cycle count: ${cycleCount}`);
            messageIndex = (messageIndex + 1) % messagesToSend.length;

            // Execute random commands after every randomCommandInterval revolutions
            if (cycleCount % randomCommandInterval === 0) {
                await executeRandomCommands();
            }

            // Wait for a random time between 11-15 seconds before sending the next message
            const randomDelay = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
            currentTimeout = setTimeout(checkAndSendMessage, randomDelay);
        } catch (error) {
            console.error('Error fetching messages or sending message:', error);
        }
    }

    rl.on('line', (input) => {
        const newMaxCycles = parseInt(input.trim(), 10);
        if (!isNaN(newMaxCycles)) {
            console.log(`Updating maxCycles to ${newMaxCycles}.`);
            console.log(isRunning);
            maxCycles = newMaxCycles;
            cycleCount = 0;
            messageIndex = 0;
            if (!isRunning) {
                isRunning = true;
                checkAndSendMessage();
                console.log('Bot restarted.');
            }
        } else {
            const lowerCaseInput = input.trim().toLowerCase();
            if (terminationTexts.some(text => lowerCaseInput.includes(text.toLowerCase()))) {
                console.log(`Input contains termination text. Stopping the bot.`);
                isRunning = false;
                handleBotCompletion();
            }
        }
    });

    checkAndSendMessage();
});

client.login(process.env.TOKEN).catch(error => {
    console.error('Error logging in:', error);
});
