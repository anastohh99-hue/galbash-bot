const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

// الآيدي الخاص بروم الترحيب (الروم اللي البوت بيرسل فيه الصورة)
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

    // خلفية الصورة
    ctx.fillStyle = '#2c2f33'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // النص الأول في الصورة
    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Welcome to the server!', 250, 100);

    // اسم العضو في الصورة
    ctx.font = '48px sans-serif';
    ctx.fillStyle = '#5865F2';
    ctx.fillText(member.user.username, 250, 160);

    // قص الصورة الشخصية بشكل دائري
    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true); 
    ctx.closePath();
    ctx.clip();

    // رسم الصورة الشخصية
    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

    // رسالة الترحيب النصية الفخمة مع المنشن التلقائي للعضو وروم القوانين
    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌𝐞𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    // إرسال الرسالة مع الصورة
    channel.send({ content: welcomeText, files: [attachment] });
});

// السطر الأخير لتسجيل الدخول
client.login(process.env.TOKEN);
