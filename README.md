# UMDHMM - Interface Web

Interface web moderne pour les outils [UMDHMM](https://github.com/psung/umdhmm) (University of Maryland Hidden Markov Model) développée avec Next.js et TypeScript.

## Fonctionnalités

- **Conversion de séquences ADN** en format numérique pour UMDHMM
- **Conversion de séquences protéiques** en indices numériques
- **Algorithme Forward** pour calculer la probabilité P(O|λ)
- **Algorithme Viterbi** pour trouver la séquence d'états la plus probable
- **Algorithme Baum-Welch** pour ré-estimer les paramètres d'un modèle HMM
- **Documentation complète** des outils disponibles

## Technologies utilisées

- **Frontend**: React, Next.js, TypeScript, Bootstrap 5
- **Backend**: API Routes Next.js, Node.js
- **Outils externes**: UMDHMM (C)

## Prérequis

- Node.js (v14+)
- npm ou yarn
- Les outils UMDHMM compilés (dans le dossier `/tools`)

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/umdhmm-web.git
   cd umdhmm-web
   ```

2. Installez les dépendances :
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Vérifiez que les outils UMDHMM sont bien présents dans le dossier `/tools` et qu'ils sont exécutables.

## Exécution

### Mode développement

```bash
npm run dev
# ou
yarn dev
```

### Construction pour la production

```bash
npm run build
npm start
# ou
yarn build
yarn start
```

## Structure du projet

- `/components` - Composants React réutilisables
- `/pages` - Pages de l'application Next.js
- `/pages/api` - API Routes pour interagir avec les outils UMDHMM
- `/tools` - Outils UMDHMM compilés

## Format des fichiers

### Fichier de séquence

Un fichier de séquence pour UMDHMM contient les éléments suivants :
```
M
T
o1 o2 ... oT
```
où :
- `M` est le nombre de symboles observables
- `T` est la longueur de la séquence
- `o1 o2 ... oT` sont les observations codées numériquement

### Fichier de modèle HMM

Un fichier HMM pour UMDHMM contient les éléments suivants :
```
N
M
A
aij ...
B
bij ...
pi
pii ...
```
où :
- `N` est le nombre d'états
- `M` est le nombre de symboles observables
- `A` représente la matrice de transition d'état
- `B` représente la matrice d'émission
- `pi` représente les probabilités initiales

## Licence

Ce projet est sous licence MIT. 
