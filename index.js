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

    // رسالة الترحيب النصية الفخمة المعتمدة
    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌e𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    try {
        // إنشاء الكانفاس بمقاس متناسق مع البانر الأزرق حقك
        const canvas = Canvas.createCanvas(800, 360);
        const ctx = canvas.getContext('2d');

        // 1. رسم الخلفية المرفوعة في جيت هاب (تأكدنا إن امتدادها png)
        const background = await Canvas.loadImage('./welcame.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // 2. إعداد مقاس ومكان الصورة الشخصية (تحت كلمة ويلكم بالضبط وبشكل أصغر ومنسق)
        const avatarSize = 100; // تصغير الحجم عشان يطلع فخم ومناسب
        const avatarX = 160;    // مكانها تحت كلمة ويلكم (مبتعدة عن الحافة اليسار)
        const avatarY = 210;    // مكانها نازل تحت الكلمة عشان ما تغطي عليها وتطلع متناسقة

        // قص الصورة الشخصية بشكل دائري احترافي
        const radius = avatarSize / 2;
        ctx.beginPath();
        ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // جلب صورة العضو ورسمها داخل الدائرة
        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png' }));
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

        // إرسال الرسالة النصية مع الصورة المدمجة
        await channel.send({ content: welcomeText, files: [attachment] });
        console.log(`📸 تم إرسال صورة الترحيب بنجاح لـ ${member.user.username}`);

    } catch (error) {
        // حماية: إذا السيرفر علق أو تأخر في قراءة الصورة، يرسل النص هنا عشان البوت ما يطفي أبداً
        console.error('⚠️ حدث خطأ بسيط في تصميم الصورة ولكن البوت مستمر في العمل:', error);
        await channel.send({ content: welcomeText });
    }
});

// السطر الأخير لتسجيل الدخول الحاف بدون علامات تنصيص
client.login(process.env.TOKEN);
