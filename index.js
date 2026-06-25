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

client.once('clientReady', () => {
    console.log(`✅ البوت جاهز لإنشاء إقامات مدينة الغلابيش!`);
});

client.on('guildMemberAdd', async member => {
    console.log(`✅ جاري إصدار الإقامة للعضو: ${member.user.username}...`);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌e𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    try {
        const canvas = Canvas.createCanvas(1280, 720); 
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage('./welcome_2.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // ==========================================
        // 1. إعدادات النصوص (تكبير الخط ونقله ليمين المربعات)
        // ==========================================
        ctx.fillStyle = '#0c221d'; 
        ctx.font = 'bold 45px Arial'; // تم تكبير الخط بشكل ممتاز
        
        // المحاذاة لليمين، عشان النص يبدأ من قبل صندوق القوانين ويمتد لجهة المربعات
        ctx.textAlign = 'right'; 
        ctx.textBaseline = 'middle'; // يخلي النص يتوسط المربع بالضبط من فوق وتحت

        // تم نقل الـ X إلى 860 (يمين المربعات الغامقة تماماً، في المساحة الفاضية)
        const textX = 860; 
        
        // وزنية الـ Y لتتطابق مع منتصف كل مربع غامق بالملي
        const nameY = 215; 
        const nickY = 290; 
        const idY = 365;   
        const dateY = 440; 

        // استخراج البيانات
        const memberName = member.user.globalName || member.user.username; 
        const memberNick = member.nickname || 'بدون لقب'; 
        const memberId = `GALB - ${member.guild.memberCount}`; 
        
        const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date());

        // طباعة النصوص في مكانها الجديد
        ctx.fillText(memberName, textX, nameY);
        ctx.fillText(memberNick, textX, nickY);
        ctx.fillText(memberId, textX, idY);
        ctx.fillText(hijriDate, textX, dateY);

        // ==========================================
        // 2. إعدادات الأفاتار (تم تكبيرها ومطابقتها للدائرة الذهبية)
        // ==========================================
        const avatarSize = 320; // كبرناها عشان تعبي الدائرة الذهبية بالكامل
        const avatarX = 75;     // سحبناها لليسار لتتوسط الإطار
        const avatarY = 205;    // رفعناها لفوق عشان تغطي الفراغ

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
