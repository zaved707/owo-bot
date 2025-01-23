require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');

const client = new Client();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const channelId = '1312765856945668217'; // Replace with your channel ID
    const channel = await client.channels.fetch(channelId);
    const messagesToSend = ['owo hunt', 'owo battle']; // Predefined list of messages
    const maxCycles = 26; // Predefined number of times the messages should be sent
    const terminationTexts = ["a​re y​ou a​ r​eal huma​n?", "stop", "Ple​ase complet​e y​our captch​a"]; // Define multiple termination texts
    const botTerminatedMessage = 'bot terminated'; // Define the 'bot terminated' text once

    // Variable to define how many times the loop runs before sending random commands
    const randomCommandInterval = 40;

    // List of random commands to be executed after every randomCommandInterval revolutions
    const randomCommands = ['owo inv', 'owo ah', 'owo help', 'owo cash'];

    let cycleCount = 0;
    let messageIndex = 0;
    let isRunning = true;

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
            if (Date.now() >= endTime) return;

            await sendMessageToUser(botTerminatedMessage);
            const randomDelay = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
            setTimeout(sendMessagesPeriodically, randomDelay);
        }

        sendMessagesPeriodically();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function containsTerminationText(message) {
        return terminationTexts.some(text => message.includes(text));
    }

    async function executeRandomCommands() {
        shuffleArray(randomCommands);
        const commandsToExecute = randomCommands.slice(0, 2); // Select only 2 random commands
        for (const command of commandsToExecute) {
            const messages = await channel.messages.fetch({ limit: 1 });
            const lastMessage = messages.first();
            if (lastMessage && containsTerminationText(lastMessage.content)) {
                console.log(`Last message contains termination text. Stopping the bot.`);
                isRunning = false;
                await handleBotTermination();
                return;
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
            await handleBotTermination();
            return;
        }

        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            const lastMessage = messages.first();
            if (lastMessage && containsTerminationText(lastMessage.content)) {
                console.log(`Last message contains termination text. Stopping the bot.`);
                isRunning = false;
                await handleBotTermination();
                return;
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
