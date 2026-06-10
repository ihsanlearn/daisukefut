# 🚀 Setup Guide

This document provides step-by-step instructions to set up the **Daisuke Canteen (Campus Food Delivery System)** on your local computer.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Cloudinary Setup (Required for Images)](#-cloudinary-setup-required-for-images)
3. [Option 1: Quick Start with Docker (Recommended)](#-option-1-quick-start-with-docker-recommended)
4. [Option 2: Local Manual Setup (No Docker)](#-option-2-local-manual-setup-no-docker)
   - [Database Setup](#1-database-setup)
   - [Backend Setup (Laravel)](#2-backend-setup-laravel)
   - [Frontend Setup (Next.js)](#3-frontend-setup-nextjs)
5. [🔑 Default Login Credentials](#-default-login-credentials)
6. [🛠️ Troubleshooting & Core Configurations](#-troubleshooting--core-configurations)

---

## 💻 Prerequisites

Ensure you have the following software installed before proceeding:

### For Docker Setup (Easiest):
* **Git**
* **Docker** & **Docker Compose**

### For Manual Setup:
* **Git**
* **PHP 8.3 or 8.4** (with `pdo_pgsql`, `zip`, `curl`, and `openssl` extensions enabled)
* **Composer v2.x**
* **Node.js v18.x or v20.x** & **npm**
* **PostgreSQL v16.x** (running locally)

---

## ☁️ Cloudinary Setup (Required for Images)

This application uses **Cloudinary** for uploading and hosting food menu images and payment receipt proofs. Without it, image uploads will fail.

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Navigate to your **Cloudinary Dashboard**.
3. Copy the following credentials:
   * **Cloud Name**
   * **API Key**
   * **API Secret**
4. Keep these values handy; you will paste them into your environment files.

---

## 🐳 Option 1: Quick Start with Docker (Recommended)

Docker will automatically spin up PostgreSQL, Adminer (database manager), the Laravel API backend, and the Next.js frontend.

### Step 1: Clone the Repository
Open your terminal and navigate to the project directory:
```bash
cd webv2
```

### Step 2: Configure root `.env` File
1. Copy the root environment template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
3. Generate an application encryption key (see Step 6 to apply this key).

### Step 3: Configure Backend `.env` File
Create a `.env` in the `backend/` folder:
```bash
cp backend/.env.example backend/.env
```
Ensure the following variables are configured inside `backend/.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=food_delivery
DB_USERNAME=food_user
DB_PASSWORD=food_password

# Cloudinary Credentials (REQUIRED)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Step 4: Configure Frontend `.env` File
Create a `.env` in the `frontend/` folder:
```bash
cp frontend/.env.example frontend/.env
```
Ensure the API URLs match the mapped ports in the root `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_WS_URL=ws://localhost:8001
```

### Step 5: Start the Containers
Build and start the application services in the background:
```bash
docker compose up -d --build
```

### Step 6: Generate APP_KEY and Run Database Migrations
Since Docker environment starts clean, you need to generate the application encryption key and execute database migrations inside the running backend container:
1. Generate the key:
   ```bash
   docker compose exec backend php artisan key:generate
   ```
   *Note: This command will automatically write the key to `backend/.env`.*
2. Copy the newly generated key from `backend/.env` (the `APP_KEY` line) and paste it into the root `.env` under the `APP_KEY` variable to synchronize the Docker configuration.
3. Run the migrations and seed database data:
   ```bash
   docker compose exec backend php artisan migrate --seed
   ```

### Step 7: Access the Web Services
Open your web browser and navigate to:
* **Frontend Client (Next.js)**: [http://localhost:3001](http://localhost:3001)
* **Backend REST API (Laravel)**: [http://localhost:8001](http://localhost:8001)
* **Adminer (Database GUI)**: [http://localhost:8081](http://localhost:8081)
  * *To login via Adminer:*
    * **System**: PostgreSQL
    * **Server**: `postgres`
    * **Username**: `food_user`
    * **Password**: `food_password`
    * **Database**: `food_delivery`

---

## 🛠️ Option 2: Local Manual Setup (No Docker)

If you prefer to run services natively on your host machine without Docker:

### 1. Database Setup
Create a PostgreSQL database named `food_delivery`:
```sql
CREATE DATABASE food_delivery;
```

### 2. Backend Setup (Laravel)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Generate the application encryption key:
   ```bash
   php artisan key:generate
   ```
5. Edit your `backend/.env` file to point to your local PostgreSQL instance and Cloudinary:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=food_delivery
   DB_USERNAME=your_postgres_username
   DB_PASSWORD=your_postgres_password

   # Cloudinary Credentials
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Sanctum Domain Configuration
   # (Important: If Next.js runs on port 3000 locally, configure these ports)
   APP_URL=http://localhost:8001
   FRONTEND_URL=http://localhost:3000
   SANCTUM_STATEFUL_DOMAINS=localhost:3000
   SESSION_DOMAIN=localhost
   ```
6. Run the migrations and seed default data:
   ```bash
   php artisan migrate --seed
   ```
7. Start the Laravel development stack:
   ```bash
   composer dev
   ```
   *(This helper script runs the HTTP server, queue listener, logs, and asset compiler concurrently. Alternatively, you can run `php artisan serve --port=8001` and `php artisan queue:listen` in separate terminals).*

---

### 3. Frontend Setup (Next.js)
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Open `frontend/.env` and verify that the backend URLs match your local Laravel server:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
   NEXT_PUBLIC_WS_URL=ws://localhost:8001
   ```
5. Run the Next.js development server:
   ```bash
   npm run dev
   ```
6. Access the Next.js application at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Default Login Credentials

The database seed command generates test accounts with roles for immediate login and feature testing.

> [!NOTE]
> The default password for **ALL** seeded accounts below is: **`password`**

### 1. Platform Administrator
* **Email**: `administrator@uns.ac.id`
* **Role**: Admin
* **Features**: Manage users, approve canteen registration requests, view platform transaction charts and analytics.

### 2. Canteen Owner Accounts
* **Email**: `kantinfmipa@gmail.com` (FMIPA Canteen)
* **Email**: `kantinalif@gmail.com` (Kantin Alif)
* **Email**: `kantintest@campus.ac.id` (Test Canteen)
* **Role**: Canteen Owner
* **Features**: Toggle Open/Close state, customize menu items, verify/reject customer payment receipts, progress orders through states.

### 3. Customer Account
* **Email**: `rafaeldaisuke@gmail.com`
* **Role**: Customer
* **Features**: Browse menu items, add items to cart, select delivery point, upload payment screenshot, track order progress.

---

## 🛠️ Troubleshooting & Core Configurations

### 1. ⚠️ HTTP 419 CSRF Token Mismatch / Login Session Fails
Laravel Sanctum uses stateful HTTP cookies to authenticate SPA requests. This requires correct domain alignments:
* **Ensure Domains Match**: If frontend runs on `localhost:3000`, the `SANCTUM_STATEFUL_DOMAINS` in `backend/.env` must contain `localhost:3000`, and `SESSION_DOMAIN` must be set to `localhost`.
* **Credential Sharing**: Make sure Next.js/Axios handles requests with credentials enabled (`credentials: 'include'` or `withCredentials: true`).
* **Session Configuration**: If you run on different ports, make sure `SESSION_SECURE_COOKIE` is set to `false` in local development and `SESSION_SAME_SITE` is set to `lax`.

### 2. ⚠️ Database Connection Failures
* **Docker Network**: In Docker setup, the backend connects to the database container using the host name `postgres`, NOT `127.0.0.1`.
* **Port conflicts**: If port `5433` (Docker Postgres port mapping) or `8001` (Docker Backend port mapping) is already occupied on your system, change the port mappings in the root `.env` file and rebuild containers (`docker compose down && docker compose up -d --build`).

### 3. ⚠️ Images Not Uploading
* Verify that you have copied the correct keys from Cloudinary.
* Check the backend logs to inspect the error:
  * Local: `tail -f backend/storage/logs/laravel.log`
  * Docker: `docker compose logs backend`
