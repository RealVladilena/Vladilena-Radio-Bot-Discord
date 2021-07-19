const { TOKEN, CHANNEL, STATUS, LIVE } = require("./config.json");
const discord = require("discord.js");
const bot = new discord.Client();
const ytdl = require('ytdl-core');
let broadcast = null;
let interval = null;

bot.on("ready", () => {
    console.log(`${bot.user.username} est en ligne !`);
    console.log(`${bot.user.username} diffuse correctement dans son vocal UwU`);
});

bot.on('ready', async () => {
  bot.user.setActivity(STATUS || "Radio");
    let channel = bot.channels.cache.get(CHANNEL) || await bot.channels.fetch(CHANNEL)

  // Ici on envoie un/plusieur message en cas d'erreur d'ID de canal discord
  if (!channel) {
      console.error("L'ID du canal fourni n'existe pas, ou je n'ai pas la permission de voir ce canal.");
    process.exit(1);
  } else if (channel.type !== "voice") {
      console.error("L'ID du canal fourni n'est pas un canal vocal.");
    process.exit(1);
  }
    broadcast = bot.voice.createBroadcast();
  // Ici on stream donc le live/vidéo youtube donner dans /config.json
  stream = ytdl(LIVE);
  stream.on('error', console.error);
  broadcast.play(stream);
  // Ici un intervalle pour que la radio se reconnecte automatiquement à YT toutes les 30 minutes parce que YT changera l'url brute toutes les 30m/1 heure.
  if (!interval) {
    interval = setInterval(async function() {
      try {
       if (stream && !stream.ended) stream.destroy();
       stream = ytdl(LIVE, { highWaterMark: 100 << 150 });
       stream.on('error', console.error);
       broadcast.play(stream);
      } catch (e) { return }
    }, 1800000)
  }
  try {
    const connection = await channel.join();
    connection.play(broadcast);
  } catch (error) {
    console.error(error);
  }
});

setInterval(async function() {
    if (!bot.voice.connections.size) {
        let channel = bot.channels.cache.get(CHANNEL) || await bot.channels.fetch(CHANNEL);
    if(!channel) return;
    try { 
      const connection = await channel.join();
      connection.play(broadcast);
    } catch (error) {
      console.error(error);
    }
  }
}, 20000);

// Le bot envoie un message en cas d'erreur de TOKEN dans le /config.json
if (!TOKEN) {
    console.error("Veuillez fournir un bot token Discord valide.");
    process.exit(1);
} else if (!CHANNEL || Number(CHANNEL) == NaN) {
    console.log("Veuillez fournir un identifiant de chaîne valide.");
    process.exit(1);
} else if (!ytdl.validateURL(LIVE)) {
    console.log("Veuillez fournir une URL Youtube valide.");
    process.exit(1);
}


bot.login(TOKEN)

process.on('unhandledRejection', console.error);
