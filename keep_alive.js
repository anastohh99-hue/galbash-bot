const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت شغال 24/7!'));

app.listen(3000, () => console.log('🌐 السيرفر الوهمي جاهز.'));