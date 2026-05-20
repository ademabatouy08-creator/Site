const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Variable temporaire pour stocker la liste des images en mémoire
let uploadedImages = [];

// Configuration de stockage des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });

// Servir les fichiers statiques (le site HTML et les images)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route pour récupérer toutes les images de Wael (pour tout le monde)
app.get('/api/images', (req, res) => {
    res.json(uploadedImages);
});

// Route pour envoyer une image (quand on tape le code 123)
app.post('/api/upload', upload.single('wael_photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Pas de fichier détecté.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    uploadedImages.push(imageUrl);
    res.json({ success: true, url: imageUrl });
});

app.listen(PORT, () => {
    console.log(`Le serveur de Wael est en ligne sur le port ${PORT}`);
});
