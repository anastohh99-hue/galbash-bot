const keepAlive = require('./keep_alive.js');
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');

// حط الآيدي بتاع روم الترحيب هنا
const WELCOME_CHANNEL_ID = '1505581496071753747';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log(`✅ البوت جاهز وشغال طلقة يا باشا!`);
});

client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    try {
        // 1. استدعاء ملف الـ GIF بتاعك (لازم يكون موجود في نفس الملفات باسم welcome.gif)
        const welcomeGif = new AttachmentBuilder('./welcome.gif', { name: 'welcome.gif' });

        // 2. تصميم رسالة الإمبد (Embed) الفخمة
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2b2d31') // درجة الرمادي الغامق بتاعة الديسكورد عشان تندمج مع الخلفية
            .setTitle(`⫷ ━━ ≼ 𝐒 𝐓 𝐀 𝐑 𝐓 ⦙ الـبـدايـة ≽ ━━ ⫸`) // التنسيق اللي اخترته
            .setDescription(`نورت سيرفر Galbash | غلبش يا <@${member.id}>!\n\n✦ ・ **رقم الدخول:** \`${member.guild.memberCount}\`\n✦ ・ **روم القوانين:** <#1505581491487375491>`)
            .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 })) // صورة العضو هتظهر بشكل دائري شيك فوق
            .setImage('attachment://welcome.gif') // الـ GIF هيشتغل بحجم كبير تحت
            .setFooter({ text: 'Galbash Studio', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        // 3. إرسال الرسالة الصاروخية في الروم
        await channel.send({ embeds: [welcomeEmbed], files: [welcomeGif] });
        console.log(`📸 تم إرسال الترحيب في ثانية لـ ${member.user.username}`);

    } catch (error) {
        console.error('⚠️ حصلت مشكلة أثناء الإرسال:', error);
    }
});

// تسجيل الدخول بالتوكن
client.login(process.env.TOKEN);
