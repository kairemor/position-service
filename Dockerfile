# Utiliser l'image officielle Node.js
FROM node:18-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application
COPY . .

# Construire le projet
RUN npm run build

# Exposer le port de l'API
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start"]
