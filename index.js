const path = require('path');
const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const { OpenAI } = require('openai');

// --- التعديل الجذري هنا ---
let openai = null;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        console.log("✅ نظام الـ AI Moderation مفعل.");
    } else {
        console.warn("⚠️ تنبيه: لم يتم العثور على OPENAI_API_KEY. الفلتر الذكي سيكون معطلاً.");
    }
} catch (error) {
    console.error("⚠️ فشل في إعداد OpenAI:", error.message);
}
// -------------------------

const fontPath = path.join(__dirname, 'font.ttf');
Canvas.registerFont(fontPath, { family: 'Galbash' });
// ... (باقي الكود كما هو)

const LOGS = {
    TIMEOUT: '1505581523376668894',
    SERVER: '1505581526950219968',
    KICK: '1505581530183897220',
    BAN: '1505581534323802217',
    FILTER: '1505581537712672889',
    ROLES: '1505581541349396570',
    NAMES: '1505581544561971250',
    DELETES: '1505581548487970967',
    VOICE: '1505581550803091538',
    CHANNELS: '1505581555005784115',
    JOINS: '1505581566875926649',
    TICKETS: '1505581569971060826',
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

client.once('clientReady', () => console.log(`✅ البوت شغال والمدينة في حماية تامة يا غلبش!`));

// --- 1. نظام الترحيب والإقامة (الوزنية المظبوطة) ---
client.on('guildMemberAdd', async member => {
    sendLog(LOGS.JOINS, `📥 **دخول:** ${member.user.tag} انضم للمدينة!`);
    
    const channel = member.guild.channels.cache.get(LOGS.WELCOME);
    if (!channel) return;

    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌e𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    try {
        const canvas = Canvas.createCanvas(1280, 720); 
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage('./welcome_2.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0c221d'; 
        ctx.font = '20px "Galbash", sans-serif'; 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 

        const textX = 660; // السنترة اللي ضبطناها
        const nameY = 220; const nickY = 295; const idY = 370; const dateY = 445; 

        const memberName = member.user.username; 
        const memberNick = member.nickname || member.user.globalName || 'بدون لقب'; 
        const memberId = `GALB - ${member.guild.memberCount}`; 
        const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(new Date());

        function drawMassiveText(text, x, y, scaleNum) {
            ctx.save();
            ctx.translate(x, y); 
            ctx.scale(scaleNum, scaleNum); 
            ctx.fillText(text, 0, 0); 
            ctx.restore();
        }

        const scaleFactor = 2.2; 
        drawMassiveText(memberName, textX, nameY, scaleFactor);
        drawMassiveText(memberNick, textX, nickY, scaleFactor);
        drawMassiveText(memberId, textX, idY, scaleFactor);
        drawMassiveText(hijriDate, textX, dateY, scaleFactor);

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
        await channel.send({ content: welcomeText, files: [attachment] });

    } catch (error) {
        console.error('⚠️ خطأ في الترحيب:', error);
    }
});

// --- 2. نظام المراقبة الشامل ---
client.on('guildMemberRemove', member => sendLog(LOGS.JOINS, `📤 **خروج:** ${member.user.tag}`));
client.on('guildBanAdd', ban => sendLog(LOGS.BAN, `🔨 **باند:** ${ban.user.tag} انطرد نهائياً.`));
client.on('messageDelete', msg => sendLog(LOGS.DELETES, `🗑️ **حذف:** رسالة من ${msg.author?.tag} تم حذفها.`));

client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        if (newMember.isCommunicationDisabled()) sendLog(LOGS.TIMEOUT, `⏱️ **تايم أوت:** العضو ${newMember.user.tag} صار له تايم أوت.`);
    }
    if (oldMember.displayName !== newMember.displayName) sendLog(LOGS.NAMES, `📝 **تغيير اسم:** ${newMember.user.tag} غير اسمه.`);
});

// --- 3. الفلتر الذكي ---
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    try {
        const moderation = await openai.moderations.create({ input: message.content });
        if (moderation.results[0].flagged) {
            message.delete();
            sendLog(LOGS.FILTER, `🤬 **الفلتر الذكي:** تم حذف شتيمة من ${message.author.tag}.\nالرسالة: "${message.content}"`);
        }
    } catch (e) { /* تجاهل أخطاء الـ AI */ }
});

client.login(process.env.TOKEN);
