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

client.on('ready', () => {
    console.log(`✅ البوت جاهز لإنشاء إقامات مدينة الغلابيش!`);
});

client.on('guildMemberAdd', async member => {
    console.log(`✅ جاري إصدار الإقامة للعضو: ${member.user.username}...`);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeText = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 Galbash | غلبش\n✦ ・  𝐌e𝐦𝐛𝐞𝐫 : <@${member.id}>\n✦ ・  𝐇𝐢𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 : ${member.guild.memberCount}\n✦ ・  Rules : <#1505581491487375491>`;

    try {
        // إنشاء اللوحة (افترضت أن مقاس تصميمك هو 1280x720)
        // إذا كان مقاس صورتك يختلف، عدل الأرقام هنا
        const canvas = Canvas.createCanvas(1280, 720); 
        const ctx = canvas.getContext('2d');

        // 1. تحميل صورة الإقامة (تأكد أن اسمها welcome_2.jpg)
        const background = await Canvas.loadImage('./welcome_2.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // ==========================================
        // 2. إعدادات النصوص واللون
        // ==========================================
        ctx.fillStyle = '#0c221d'; // اللون اللي طلبته
        ctx.font = 'bold 28px Arial'; // حجم ونوع الخط (تقدر تكبره لو احتجت)
        ctx.textAlign = 'right'; // محاذاة لليمين عشان الكتابة تبدأ من عند الكلمة وتروح يسار باتجاه الصورة

        // الإحداثيات (تحتاج وزنية خفيفة منك لتطابق الخطوط المنقطة بالملي)
        const textX = 520; // مكان وقوف النص من اليمين (يفضل يكون قبل كلمة "الاسم")
        const nameY = 220; // ارتفاع سطر الاسم
        const nickY = 295; // ارتفاع سطر اللقب
        const idY = 370;   // ارتفاع سطر رقم الإقامة
        const dateY = 445; // ارتفاع سطر تاريخ الإصدار

        // استخراج البيانات
        const memberName = member.user.globalName || member.user.username; // الاسم الأساسي
        const memberNick = member.nickname || 'بدون لقب'; // النيك نيم في السيرفر
        const memberId = `GALB - ${member.guild.memberCount}`; // رقم الإقامة
        
        // تحويل تاريخ دخول السيرفر إلى هجري
        const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date());

        // طباعة النصوص على الصورة
        ctx.fillText(memberName, textX, nameY);
        ctx.fillText(memberNick, textX, nickY);
        ctx.fillText(memberId, textX, idY);
        ctx.fillText(hijriDate, textX, dateY);

        // ==========================================
        // 3. إعدادات صورة العضو (الأفاتار)
        // ==========================================
        // (تحتاج توزنها عشان تجي بنص الدائرة بالضبط)
        const avatarSize = 290; // حجم الدائرة
        const avatarX = 90;     // موقع الدائرة من اليسار
        const avatarY = 200;    // موقع الدائرة من الأعلى

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

        // 4. الإرسال
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `iqama-${Date.now()}.jpg` });
        
        await channel.send({ content: welcomeText, files: [attachment] });
        console.log(`📸 تم إصدار الإقامة بنجاح لـ ${member.user.username}`);

    } catch (error) {
        console.error('⚠️ حدث خطأ أثناء معالجة الإقامة:', error);
        await channel.send({ content: welcomeText });
    }
});

client.login(process.env.TOKEN);
