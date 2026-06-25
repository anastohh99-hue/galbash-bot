const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

const WELCOME_CHANNEL_ID = '1505581496071753747';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// 🎲 قائمة الرتب العشوائية اللي تبيها تظهر داخل الصورة
const randomRanks = [
    "الرتبة: أسطوري 👑",
    "الرتبة: محترف ⚔️",
    "الرتبة: نادر 💎",
    "الرتبة: ملحمي 🐉",
    "الرتبة: مبتدئ 🐣"
];

client.on('ready', () => {
    console.log(`✅ البوت جاهز لإنشاء صور الترحيب السريعة!`);
});

client.on('guildMemberAdd', async member => {
    console.log(`✅ جاري معالجة الصورة للعضو: ${member.user.username}...`);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌e𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    try {
        // 1. اختيار رتبة عشوائية من القائمة
        const randomRank = randomRanks[Math.floor(Math.random() * randomRanks.length)];

        // 2. إعداد لوحة الرسم (نفس مقاساتك القديمة)
        const canvas = Canvas.createCanvas(800, 360);
        const ctx = canvas.getContext('2d');

        // 3. تحميل صورة الخلفية الثابتة (لازم يكون عندك ملف اسمه welcome.png)
        const background = await Canvas.loadImage('./welcome.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // 4. كتابة الرتبة العشوائية "داخل" الصورة
        ctx.font = 'bold 35px Arial'; // نوع وحجم الخط
        ctx.fillStyle = '#ffffff'; // لون الخط (أبيض)
        ctx.textAlign = 'center'; // توسيط النص
        // الأرقام هنا (400, 320) هي مكان النص (X, Y) وتقدر تعدلها عشان تناسب تصميمك
        ctx.fillText(randomRank, 400, 320); 

        // 5. رسم صورة العضو الدائرية (نفس إعداداتك اللي وزنتها أنت)
        const avatarSize = 160; 
        const avatarX = 350;    
        const avatarY = 120;    

        const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
        const avatar = await Canvas.loadImage(avatarURL);

        ctx.save();
        const radius = avatarSize / 2;
        ctx.beginPath();
        ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // 6. إرسال الصورة للديسكورد
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `welcome-${Date.now()}.png` });
        
        await channel.send({ content: welcomeText, files: [attachment] });
        console.log(`📸 تم إرسال الصورة بنجاح لـ ${member.user.username}`);

    } catch (error) {
        console.error('⚠️ حدث خطأ أثناء معالجة الصورة:', error);
        await channel.send({ content: welcomeText });
    }
});

client.login(process.env.TOKEN);
