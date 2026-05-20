const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// État du serveur (Sain ou Crashé pour tout le monde)
let isSystemCrashed = false;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

let uploadedImages = [];

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });

app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadDir));
app.use(express.json());

// ROUTE INTERCEPTOR : Si le système est crashé, on bloque tout
app.use((req, res, next) => {
    if (isSystemCrashed && req.url.startsWith('/api')) {
        return res.status(500).json({ systemStatus: 'CRASHED' });
    }
    next();
});

// ROUTE 1 : Envoyer la liste des images
app.get('/api/images', (req, res) => {
    res.json({ systemStatus: 'OK', images: uploadedImages });
});

// ROUTE 2 : Recevoir une nouvelle photo (Code 123)
app.post('/api/upload', upload.single('wael_photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });
    const imageUrl = `/uploads/${req.file.filename}`;
    uploadedImages.push(imageUrl);
    res.json({ success: true, url: imageUrl });
});

// ROUTE 3 : Déclenchement du crash mondial (Bouton Rouge / Code 321)
app.post('/api/trigger-global-crash', (req, res) => {
    isSystemCrashed = true;
    console.log("⚠️ ALERTE : Le système global a été détruit par une injection SQL !");
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Le serveur de Wael est en ligne sur le port ${PORT}`);
});
