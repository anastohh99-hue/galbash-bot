const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const GIFEncoder = require('gifencoder');
const gifFrames = require('gif-frames');

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
    console.log(`✅ البوت جاهز لإنشاء صور GIF الترحيبية!`);
});

client.on('guildMemberAdd', async member => {
    console.log(`✅ جاري معالجة GIF للعضو: ${member.user.username}... (قد يستغرق بضع ثواني)`);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌e𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    try {
        // 1. تفكيك إطارات خلفية الـ GIF
        const frames = await gifFrames({ url: './welcome.gif', frames: 'all', outputType: 'canvas', cumulative: true });

        // 2. إعداد محرك الـ GIF بنفس مقاساتنا
        const encoder = new GIFEncoder(800, 360);
        encoder.start();
        encoder.setRepeat(0);   // 0 يعني تكرار لا نهائي
        encoder.setDelay(frames[0].frameInfo.delay * 10); // ضبط سرعة الحركة بناءً على الملف الأصلي
        encoder.setQuality(10); // الجودة (رقم أقل يعني جودة أعلى)

        const canvas = Canvas.createCanvas(800, 360);
        const ctx = canvas.getContext('2d');

        // 🟢 المقاسات اللي ضبطناها مع بعض 🟢
        const avatarSize = 160; 
        const avatarX = 350;    
        const avatarY = 120;    

        // 3. تحميل صورة العضو الدائرية
        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 })); // قللنا حجم الأفاتار شوي عشان ما يعلق السيرفر

        // 4. دمج صورة العضو مع كل إطار من إطارات الـ GIF
        for (let i = 0; i < frames.length; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // رسم إطار الخلفية
            ctx.drawImage(frames[i].getImage(), 0, 0, canvas.width, canvas.height);

            // حفظ حالة الرسم قبل القص
            ctx.save();

            // قص الدائرة
            const radius = avatarSize / 2;
            ctx.beginPath();
            ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // رسم صورة العضو
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

            // استعادة حالة الرسم عشان ما يقص الإطار اللي بعده
            ctx.restore();

            // إضافة الإطار النهائي لملف الـ GIF الجديد
            encoder.addFrame(ctx);
        }

        encoder.finish(); // إنهاء تجميع الـ GIF

        // 5. إرسال الـ GIF النهائي للديسكورد
        const attachment = new AttachmentBuilder(encoder.out.getData(), { name: `welcome-${Date.now()}.gif` });
        
        await channel.send({ content: welcomeText, files: [attachment] });
        console.log(`📸 تم إرسال الـ GIF بنجاح لـ ${member.user.username}`);

    } catch (error) {
        console.error('⚠️ حدث خطأ أثناء معالجة الـ GIF:', error);
        await channel.send({ content: welcomeText });
    }
});

// تسجيل الدخول
client.login(process.env.TOKEN);
