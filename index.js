const TelegramBot = require('node-telegram-bot-api');
const token = '7994037471:AAHGcnhZsvLZh03HTBYRKeXCmkResK7Kvh8';
const bot = new TelegramBot(token, { polling: true });

const CHANNEL_ID = -1002024415498; // Remplace par l'ID réel de ton channel
const POST_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 1 jour

const userPosts = new Map();

function cleanOldTimestamps(userId) {
  const now = Date.now();
  const timestamps = userPosts.get(userId) || [];
  const fresh = timestamps.filter(ts => now - ts < WINDOW_MS);
  userPosts.set(userId, fresh);
  return fresh;
}

bot.on('channel_post', (msg) => {
  if (msg.chat.id !== CHANNEL_ID) return;
  if (!msg.sender_chat) return;

  const userId = msg.sender_chat.id;

  const messages = cleanOldTimestamps(userId);

  if (messages.length >= POST_LIMIT) {
    bot.deleteMessage(msg.chat.id, msg.message_id).catch(console.error);
    bot.sendMessage(userId, `❗ Vous ne pouvez poster que ${POST_LIMIT} fois par jour dans ce channel.`)
      .catch(() => {});
  } else {
    messages.push(Date.now());
    userPosts.set(userId, messages);
  }
});
