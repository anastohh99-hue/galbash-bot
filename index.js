const path = require('path');
const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const { OpenAI } = require('openai');

// إعداد الـ AI (آمن)
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const LOGS = {
    TIMEOUT: '1505581523376668894',
    JOINS: '1505581566875926649',
    FILTER: '1505581537712672889',
    BAN: '1505581534323802217',
    DELETES: '1505581548487970967',
    NAMES: '1505581544561971250',
    WELCOME: '1505581496071753747'
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
    ]
});

async function sendLog(channelId, message) {
    const channel = client.channels.cache.get(channelId);
    if (channel) channel.send(message).catch(console.error);
}

client.once('clientReady', () => console.log(`✅ البوت شغال والمدينة في حماية تامة!`));

// --- نظام الترحيب (بدون ملفات خارجية) ---
client.on('guildMemberAdd', async member => {
    sendLog(LOGS.JOINS, `📥 **دخول:** ${member.user.tag}`);
    const channel = member.guild.channels.cache.get(LOGS.WELCOME);
    if (!channel) return;

    try {
        const canvas = Canvas.createCanvas(1280, 720); 
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage('./welcome_2.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // إعداد الخط (استخدمنا sans-serif للابتعاد عن مشاكل الملفات)
        ctx.fillStyle = '#0c221d'; 
        ctx.font = '40px sans-serif'; // هنا تقدر تتحكم بحجم الخط مباشرة
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 

        const textX = 660; 
        const nameY = 220; const nickY = 295; const idY = 370; const dateY = 445; 

        // النصوص
        const memberName = member.user.username; 
        const memberNick = member.nickname || member.user.globalName || 'بدون لقب'; 
        const memberId = `GALB - ${member.guild.memberCount}`; 
        const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(new Date());

        // طباعة النصوص مباشرة (بدون ضرب في 2.2)
        ctx.fillText(memberName, textX, nameY);
        ctx.fillText(memberNick, textX, nickY);
        ctx.fillText(memberId, textX, idY);
        ctx.fillText(hijriDate, textX, dateY);

        // الأفاتار
        const avatarSize = 332; const avatarX = 67; const avatarY = 225;    
        const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 512 });
        const avatar = await Canvas.loadImage(avatarURL);

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + (avatarSize/2), avatarY + (avatarSize/2), avatarSize/2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `iqama-${Date.now()}.jpg` });
        await channel.send({ files: [attachment] });
    } catch (error) { console.error('⚠️ خطأ في الترحيب:', error); }
});

// ... (نظام المراقبة والفلتر كما هو)

client.login(process.env.TOKEN);
