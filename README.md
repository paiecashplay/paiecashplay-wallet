# PaieCashPlay Wallet

Service de wallet et paiement centralisé pour l'écosystème PaieCashPlay.

## Fonctionnalités

- ✅ Authentification OAuth2 centralisée
- ✅ Création automatique de wallet à la première connexion
- ✅ Dashboard complet avec statistiques
- ✅ Historique des transactions et paiements
- ✅ Interface d'encaissement et décaissement
- ✅ Page de paiement centralisé via URL
- ✅ Interface d'administration
- ✅ Notifications par email
- ✅ Intégration Stripe

## Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

4. Configurer la base de données :
```bash
npm run db:push
npm run db:generate
```

5. Lancer le serveur de développement :
```bash
npm run dev
```

## Configuration

### Variables d'environnement requises

- `DATABASE_URL` : URL de connexion PostgreSQL
- `OAUTH_CLIENT_ID` : ID client OAuth PaieCashPlay
- `OAUTH_CLIENT_SECRET` : Secret client OAuth PaieCashPlay
- `STRIPE_SECRET_KEY` : Clé secrète Stripe
- `SMTP_*` : Configuration email
- `ADMIN_EMAIL` : Email de l'administrateur

### Webhook Stripe

Configurer l'endpoint webhook Stripe sur : `/api/payments/webhook`

## Utilisation

### Créer un lien de paiement

```javascript
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1000, // en FCFA
    description: 'Paiement test'
  })
})

const { paymentUrl } = await response.json()
// Rediriger vers paymentUrl
```

### API Endpoints

- `GET /api/wallet/balance` - Solde du wallet
- `GET /api/wallet/transactions` - Historique des transactions
- `POST /api/wallet/deposit` - Effectuer un dépôt
- `POST /api/wallet/withdraw` - Effectuer un retrait
- `POST /api/payments/create` - Créer un lien de paiement
- `GET /api/admin/stats` - Statistiques admin

## Architecture

- **Frontend** : Next.js 14 avec App Router
- **Backend** : API Routes Next.js
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : NextAuth.js avec OAuth2
- **Paiements** : Stripe
- **Emails** : Nodemailer
- **Styling** : Tailwind CSS

## Sécurité

- Authentification OAuth2 centralisée
- Vérification des permissions admin
- Validation des montants et soldes
- Transactions atomiques en base
- Webhooks sécurisés Stripe