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
- **Framer Motion** (optional motion/animation)
- **Lucide-React** and **Recharts** (for icons/charts)

---
