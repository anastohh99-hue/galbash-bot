const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

// التوكن الخاص بالبوت
const TOKEN = process.env.TOKEN;
// الآيدي الخاص بروم الترحيب
const WELCOME_CHANNEL_ID = '1505581496071753747';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log(`✅ البوت جاهز ومسجل باسم ${client.user.tag}`);
});

client.on('guildMemberAdd', async member => {
    console.log(`✅ في شخص دخل السيرفر واسمه: ${member.user.username}`);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2c2f33'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Welcome to the server!', 250, 100);

    ctx.font = '48px sans-serif';
    ctx.fillStyle = '#5865F2';
    ctx.fillText(member.user.username, 250, 160);

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true); 
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

    channel.send({ content: `أهلاً بك <@${member.id}>! 🎉`, files: [attachment] });
});

client.login(TOKEN);