```markdown
# GraphQL React App

This repository contains a React application that uses GraphQL queries to interact with the Reboot01 GraphQL Engine. It includes a login system, protected routes, and a profile page that displays user information, recent projects, XP, and skills visualizations.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Authentication Flow](#authentication-flow)
- [Scripts](#scripts)
- [Deployment to Netlify](#deployment-to-netlify)
- [Additional Resources](#additional-resources)
- [License](#license)

---

## Overview

This project is a React application bootstrapped with [Create React App](https://create-react-app.dev), which integrates with the Reboot01 platform’s GraphQL API for data retrieval. The app uses an authentication flow that stores a JWT token in local storage and protects certain routes (e.g., the profile page) from unauthenticated users.

Key components include:
- **Login**: A page where users enter credentials and receive a JWT token if valid.
- **Profile**: A protected page that fetches user data, XP, skill transactions, and more from the GraphQL API once the user is logged in.
- **AuthContext**: A custom context to manage the authentication state across the app.

---

## Features

1. **Authentication**:  
   - Login system using `fetch` with Basic Auth.  
   - Stores JWT token in local storage for subsequent GraphQL requests.

2. **Protected Routes**:  
   - Users must be logged in to view the Profile page. Otherwise, they’re redirected to Login.

3. **GraphQL Queries**:  
   - Fetch user info, transactions, XP totals, skill data, and more from the Reboot01 GraphQL Engine.

4. **Data Visualization**:  
   - Simple radar chart to visualize user skill data.  
   - Bar chart to display specific tech-skill amounts.

5. **Logout**:  
   - Clears token from local storage and redirects users back to the Login page.

---

## Tech Stack

- **React** (Create React App)
- **React Router DOM** (for client-side routing)
- **Apollo Client** (for GraphQL queries)
- **Tailwind CSS** (some utility styling)
- **Framer Motion** (optional motion/animation)
- **Lucide-React** and **Recharts** (for icons/charts)

---

## Folder Structure

```
.
├── public
│   └── index.html
├── src
│   ├── pages
│   │   ├── Login.js
│   │   └── Profile.js
│   ├── utils
│   │   ├── AuthContext.js
│   │   └── apolloClient.js
│   ├── App.js
│   ├── index.js
│   └── ...
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (LTS recommended, e.g., Node 16)
- **npm** or **yarn**

### Installation

1. **Clone** the repository:
   ```bash
   git clone https://github.com/YourUsername/YourRepo.git
   cd YourRepo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn
   ```

### Environment Variables

If needed, add environment-specific settings in a `.env` file. For example:
```shell
NODE_OPTIONS=--openssl-legacy-provider
```
(This helps avoid certain crypto issues when using Node 17+.)

### Running Locally

1. **Start the development server**:
   ```bash
   npm start
   ```
   or
   ```bash
   yarn start
   ```

2. **Open** your browser at [http://localhost:3000](http://localhost:3000).

3. **Log in** with valid credentials. Successful login will store the JWT token in local storage, allowing you to access the protected profile route.

---

## Authentication Flow

1. **Login Page** (`Login.js`):  
   - Collects user credentials (identifier + password).  
   - Sends a `POST` request to `https://learn.reboot01.com/api/auth/signin`.  
   - On success, retrieves a token from the response and calls `login(token)` from `AuthContext`.  

2. **AuthContext**:
   - Stores the token in React state and in local storage.  
   - Provides `login` and `logout` methods to manage session state across the app.

3. **PrivateRoute** in `App.js`:
   - Checks if `token` exists in `AuthContext`.  
   - If no token, redirects to `/login`.  
   - If token exists, loads the requested protected page (`Profile`).

4. **Logout**:
   - Calls the `logout()` method in `AuthContext`, clearing the token from local storage.  
   - Redirects the user back to the `/login` route.

---

## Scripts

Within the project directory, you can run:

- **Start in Dev Mode**:
  ```bash
  npm start
  ```
- **Run Tests**:
  ```bash
  npm test
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Eject** (not recommended):
  ```bash
  npm run eject
  ```
  This is a one-way operation that gives you full control over config files.

---

## Deployment to Netlify

1. **Remove or update** any `"homepage"` value in your `package.json` if it references GitHub Pages (for example, `"homepage": "https://yourusername.github.io/projectname"`). For Netlify, you typically remove that field or set `"homepage": "."`.
2. **Create a new site** in Netlify, linked to your Git repository.
3. **Build settings**:  
   - Build command: `npm run build`  
   - Publish directory: `build`
4. (Optional) **Set environment variables**:
   - In the Netlify dashboard, go to **Site Settings** → **Build & Deploy** → **Environment** → **Environment Variables**.  
   - Add `NODE_OPTIONS = --openssl-legacy-provider` if you experience issues building with Node 17+.
5. **Deploy**:
   - Commit and push your changes. Netlify automatically detects the new commit and rebuilds/deploys your site.

---

## Additional Resources

- **Create React App Documentation**:  
  [https://create-react-app.dev/docs/getting-started/](https://create-react-app.dev/docs/getting-started/)
- **React Documentation**:  
  [https://reactjs.org/docs/getting-started.html](https://reactjs.org/docs/getting-started.html)
- **Apollo Client**:  
  [https://www.apollographql.com/docs/react/](https://www.apollographql.com/docs/react/)
- **Learn Reboot01** (GraphQL Engine Reference):  
  [https://learn.reboot01.com/api/graphql-engine/v1/graphql](https://learn.reboot01.com/api/graphql-engine/v1/graphql)

---