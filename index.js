const path = require('path');
const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

// إعداد الخط
const fontPath = path.join(__dirname, 'font.ttf');
Canvas.registerFont(fontPath, { family: 'Galbash' });

const WELCOME_CHANNEL_ID = '1505581496071753747';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`✅ البوت جاهز لإنشاء إقامات مدينة الغلابيش!`);
});

client.on('guildMemberAdd', async member => {
    console.log(`✅ جاري إصدار الإقامة للعضو: ${member.user.username}...`);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    // 👇 الترحيب بالثيم الملكي الجديد
    const welcomeText = `𓆩👑𓆪-𝐖𝐞𝐥𝐜𝐨𝐦𝐞-𝐓𝐨-𝐆𝐚𝐥𝐛𝐚𝐬𝐡-⠇مـديـنـة-الـغـلـابـيـش

> 𓆩 🏰 𓆪 ⠇ **أهـلاً وسـهـلاً بـك فـي مـديـنـة الـغـلـابـيـش**
> 𓆩 ✨ 𓆪 ⠇ تم استخراج إقامتك الرسمية بنجاح!

𓆩 👤 𓆪 ⠇ **المواطن:** <@${member.id}>
𓆩 🪪 𓆪 ⠇ **رقم الإقامة:** \`GALB - ${member.guild.memberCount}\`
𓆩 📜 𓆪 ⠇ **قوانين المدينة:** <#1505581491487375491>

𓆩🤍𓆪 ⠇ نتمنى لك إقامة سعيدة بين أهلك الغلابيش!`;

    try {
        const canvas = Canvas.createCanvas(1280, 720); 
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage('./welcome_2.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // ==========================================
        // 1. إعدادات النصوص
        // ==========================================
        ctx.fillStyle = '#0c221d'; 
        ctx.font = '21px "Galbash"'; 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 

        const textX = 730; 
        const nameY = 210; 
        const nickY = 285; 
        const idY = 360;   
        const dateY = 435; 

        const memberName = member.user.username; 
        const memberNick = member.nickname || member.user.globalName || 'بدون لقب'; 
        const memberId = `GALB - ${member.guild.memberCount}`; 
        const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(new Date());

        ctx.fillText(memberName, textX, nameY);
        ctx.fillText(memberNick, textX, nickY);
        ctx.fillText(memberId, textX, idY);
        ctx.fillText(hijriDate, textX, dateY);

        // ==========================================
        // 2. إعدادات الأفاتار 
        // ==========================================
        const avatarSize = 332; 
        const avatarX = 67;      
        const avatarY = 225;    

        const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 512 });
        const avatar = await Canvas.loadImage(avatarURL);

        ctx.save();
        const radius = avatarSize / 2;
        ctx.beginPath();
        ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `iqama-${Date.now()}.jpg` });
        
        await channel.send({ content: welcomeText, files: [attachment] });
        console.log(`📸 تم إصدار الإقامة بنجاح لـ ${member.user.username}`);

    } catch (error) {
        console.error('⚠️ حدث خطأ أثناء معالجة الإقامة:', error);
        await channel.send({ content: welcomeText });
    }
});

client.login(process.env.TOKEN);
