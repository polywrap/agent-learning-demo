import { ChatCompletionRequestMessage } from "openai";
import winston from "winston";
const figlet = require("figlet");
const path = require('path');
import chalk from "chalk";
import fs from 'fs';
import { Agent } from "../agent";


/**
 * Gets the log file name based on the current date and time.
 * @returns {string} The log file name.
 */
const getLogFileName = () => {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  return `chats/chat_${formattedDate}.md`;
}

const logger = winston.createLogger({
  format: winston.format.printf(info => `${info.message}`),
  transports: [
    new winston.transports.File({ filename: getLogFileName() }),
  ],
});

/**
 * Logs a message to file.
 * @param {ChatCompletionRequestMessage} message The message to log.
 */
export const logToFile = (message: ChatCompletionRequestMessage) => {
  logger.info(`

  
  **${message.role.toUpperCase()}**: ${message.content}`);
};

/**
 * Logs a stylized header to the console.
 */
export const logHeader = () => {
  figlet.text('PolyGPT', {
    font: 'Slant',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    whitespaceBreak: true
  }, function(err: Error | null, data?: string) {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      
      return;
    }
    console.log(data);
    console.log(`
    You should now be transferred to the AI agent. If it doesn't load in 10 seconds, restart the CLI application with Ctrl+C.
    
    Once loaded, begin by giving it a goal. Right then you'll be able to ask to give you a detailed plan to achieve the goal!
    
    To enable autopilot, type "auto -N" and press enter. N is the number of steps you want the autopilot to take. For example, "auto -3" will make the autopilot take 3 steps. Beware this might make your runs take a long time, loop and waste more tokens than needed.

    To exit the application at any time, press Ctrl+C.

    For more info and support join our Discord server: https://discord.com/invite/Z5m88a5qWu

    Welcome to the future!
    
    `)
    logger.info('```\n' + data + '\n```');
  });
};

/**
 * Prints an error in a pretty format.
 * @param {any} error The error to print.
 */
export function prettyPrintError(error: any): void {
  console.error(chalk.red('Something went wrong:'));
  if (error.response) {
    console.error(chalk.yellow('Response Status:'), chalk.blueBright(error.response.status));
    console.error(chalk.yellow('Response Data:'), chalk.blueBright(JSON.stringify(error.response.data, null, 2)));
  }
  if (error.request) {
    console.error(chalk.yellow('Request:'), chalk.blueBright(JSON.stringify(error.request, null, 2)));
  }
  console.error(chalk.yellow('Message:'), chalk.blueBright(error.message));
}


// Define the directory path
const dirPath = path.join(__dirname, '..', '..', 'workspace');

// Check if the directory exists
if (!fs.existsSync(dirPath)){
    // If the directory does not exist, create it
    fs.mkdirSync(dirPath, { recursive: true });
}


/**
 * Saves the chat history to a file.
 * @param {Agent} agent The agent whose chat history is to be saved.
 */
export function saveChatHistoryToFile(agent: Agent) {
  const combinedChatHistory = [
    ...agent._initializationMessages,
    ...agent._loadwrapData,
    ...agent._chatInteractions
  ];

  const chatHistoryStr = combinedChatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  fs.writeFileSync(path.join(dirPath, 'chat-history.txt'), chatHistoryStr, 'utf-8');
}
