const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

// 👇 الضربة القاضية: هنا نغصب البوت يقرأ ملف الخط حقنا
Canvas.registerFont('./font.ttf', { family: 'GalbashFont' });

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
        // 1. إعدادات النصوص 
        // ==========================================
        ctx.fillStyle = '#0c221d'; 
        
        // 👇 هنا نستخدم الخط اللي سجلناه فوق، والحجم 50 بكسل (قابل للتعديل براحتك الحين!)
        ctx.font = '50px "GalbashFont"'; 
        
        ctx.textAlign = 'right'; 
        ctx.textBaseline = 'middle'; 

        const textX = 725; 
        
        const nameY = 220; 
        const nickY = 295; 
        const idY = 370;   
        const dateY = 445; 

        const memberName = member.user.username; 
        const memberNick = member.nickname || member.user.globalName || 'بدون لقب'; 
        const memberId = `GALB - ${member.guild.memberCount}`; 
        
        const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date());

        ctx.fillText(memberName, textX, nameY);
        ctx.fillText(memberNick, textX, nickY);
        ctx.fillText(memberId, textX, idY);
        ctx.fillText(hijriDate, textX, dateY);

        // ==========================================
        // 2. إعدادات الأفاتار (مضبوطة ومقفل عليها)
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
