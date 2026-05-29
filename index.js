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

    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌e𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    try {
        const canvas = Canvas.createCanvas(800, 360);
        const ctx = canvas.getContext('2d');

        // رسم الخلفية
        const background = await Canvas.loadImage('./welcame.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // 🌟 الإحداثيات والمقاسات الجديدة لتطابق الدائرة الزرقاء تماماً 🌟
        const avatarSize = 160;   // تكبير حجم الصورة لتكون واضحة ومتناسقة
        const avatarX = 245;      // دفع الصورة لليتموضع تحت بداية كلمة WELCOME
        const avatarY = 160;      // إنزال الصورة لترسم في المساحة الفارغة تحت الكلام

        // حفظ حالة الكانفاس لتجنب المشاكل البرمجية عند القص
        ctx.save();

        // قص الدائرة بدقة هندسية
        const radius = avatarSize / 2;
        ctx.beginPath();
        ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // رسم صورة العضو بأعلى جودة داخل الدائرة المقصوصة
        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png', size: 1024 }));
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

        // استعادة حالة الكانفاس الطبيعية
        ctx.restore();

        // التغليف والإرسال ل ديسكورد
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `welcome-${Date.now()}.png` });

        await channel.send({ content: welcomeText, files: [attachment] });
        console.log(`📸 تم إرسال صورة الترحيب بنجاح لـ ${member.user.username}`);

    } catch (error) {
        console.error('⚠️ حدث خطأ في تصميم الصورة:', error);
        await channel.send({ content: welcomeText });
    }
});

// تسجيل الدخول
client.login(process.env.TOKEN);
