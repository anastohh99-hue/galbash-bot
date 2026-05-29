const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

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

    // حددنا مقاس مناسب للصورة عشان تتناسق مع البانر حقك
    const canvas = Canvas.createCanvas(800, 360);
    const ctx = canvas.getContext('2d');

    // 1. رسم الخلفية (الصورة اللي رفعتها)
    // ملاحظة: إذا غيرت اسم الصورة في قيت هاب، لازم تغير الاسم هنا بين القوسين
    const background = await Canvas.loadImage('./welcame.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // 2. إعداد مقاس ومكان الصورة الشخصية (تحت كلمة ويلكم يسار)
    const avatarSize = 130; // حجم الدائرة
    const avatarX = 120;    // البعد من اليسار
    const avatarY = 160;    // البعد من فوق

    // قص الصورة الشخصية بشكل دائري
    const radius = avatarSize / 2;
    ctx.beginPath();
    ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // جلب صورة العضو ورسمها داخل الدائرة
    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

    // رسالة الترحيب النصية
    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌𝐞𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    // إرسال الرسالة مع الصورة
    channel.send({ content: welcomeText, files: [attachment] });
});

// السطر الأخير لتسجيل الدخول
client.login(process.env.TOKEN);
