const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration du dossier pour stocker les images de Wael
// On le crée à la racine pour s'aligner avec l'arborescence simple
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Liste en mémoire pour stocker l'historique des images
let uploadedImages = [];

// Configuration de multer pour la réception des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Donne un nom unique pour éviter que deux fichiers s'écrasent
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });

// Permet au serveur de lire les fichiers à la racine (index.html) et le dossier uploads
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadDir));
app.use(express.json());

// ROUTE 1 : Envoyer la liste des images à tout le monde
app.get('/api/images', (req, res) => {
    res.json(uploadedImages);
});

// ROUTE 2 : Recevoir une nouvelle photo (Déclenchée par le code 123)
app.post('/api/upload', upload.single('wael_photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier reçu.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    uploadedImages.push(imageUrl);
    res.json({ success: true, url: imageUrl });
});

// Lancement du serveur sur Render
app.listen(PORT, () => {
    console.log(`Le serveur de Wael est en ligne sur le port ${PORT}`);
});
