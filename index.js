const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const GIFEncoder = require('gifencoder');
const gifFrames = require('gif-frames');

const WELCOME_CHANNEL_ID = '1505581496071753747';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// 🛠️ دالة جديدة لتحويل بيانات الـ GIF إلى صورة يفهمها السيرفر
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

client.on('ready', () => {
    console.log(`✅ البوت جاهز لإنشاء صور GIF الترحيبية!`);
});

client.on('guildMemberAdd', async member => {
    console.log(`✅ جاري معالجة GIF للعضو: ${member.user.username}... (قد يستغرق بضع ثواني)`);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌e𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    try {
        // 1. تفكيك الـ GIF باستخدام صيغة PNG بدل المتصفح
        const frames = await gifFrames({ url: './welcome.gif', frames: 'all', outputType: 'png', cumulative: true });

        // 2. إعداد محرك الـ GIF
        const encoder = new GIFEncoder(800, 360);
        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(frames[0].frameInfo.delay * 10);
        encoder.setQuality(10);

        const canvas = Canvas.createCanvas(800, 360);
        const ctx = canvas.getContext('2d');

        // المقاسات
        const avatarSize = 160; 
        const avatarX = 350;    
        const avatarY = 120;    

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));

        // 3. دمج صورة العضو مع كل إطار
        for (let i = 0; i < frames.length; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // تحويل الإطار لصورة قابلة للرسم
            const frameBuffer = await streamToBuffer(frames[i].getImage());
            const frameImage = await Canvas.loadImage(frameBuffer);

            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

            ctx.save();
            const radius = avatarSize / 2;
            ctx.beginPath();
            ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();

            encoder.addFrame(ctx);
        }

        encoder.finish();

        // 4. إرسال الصورة للديسكورد
        const attachment = new AttachmentBuilder(encoder.out.getData(), { name: `welcome-${Date.now()}.gif` });
        
        await channel.send({ content: welcomeText, files: [attachment] });
        console.log(`📸 تم إرسال الـ GIF بنجاح لـ ${member.user.username}`);

    } catch (error) {
        console.error('⚠️ حدث خطأ أثناء معالجة الـ GIF:', error);
        // يرسل رسالة نصية لو فشل التصميم
        await channel.send({ content: welcomeText });
    }
});

client.login(process.env.TOKEN);
