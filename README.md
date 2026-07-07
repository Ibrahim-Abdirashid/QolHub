# QolHub

QolHub is a rental property platform that connects property owners with tenants in Somaliland, with an initial focus on Borama.

## Tech Stack

- **Next.js 16** with App Router
- **MongoDB** and Mongoose
- **Tailwind CSS**
- **JWT authentication** using cookies

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/qolhub.git
cd qolhub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MongoDB

Install MongoDB locally or create a database using [MongoDB Atlas](https://www.mongodb.com/atlas).

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Add the following variables to `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/qolhub
JWT_SECRET=your-secure-jwt-secret
```

### 5. Run the Development Server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

## Demo Data

After MongoDB is running, seed the database using:

```bash
curl -X POST http://localhost:3000/api/seed
```

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@qolhub.so | password123 |
| Property Owner | milkiile@qolhub.so | password123 |
| Tenant | tenant@qolhub.so | password123 |

## Main Pages

- `/` — Home page
- `/properties` — Property listings
- `/properties/[id]` — Property details
- `/auth/login` — Login page
- `/auth/register` — Registration page
- `/dashboard` — Property owner dashboard
- `/admin` — Admin dashboard

## How It Works

1. A property owner creates an account and submits a property.
2. The property can be an entire vacant house or an available room in an occupied house.
3. The admin reviews and approves the property.
4. Approved properties become visible to tenants.
5. Tenants search for properties and contact property owners.

## Project Purpose

QolHub simplifies the process of finding rental properties in Borama, especially for university students, visitors, and local residents searching for suitable accommodation.

## Planned Features

- Online payments
- Property image uploads using Cloudinary or Amazon S3
- Real-time messaging between tenants and property owners

## Build for Production

```bash
npm run build
npm start
```

## Git Commands

Use the following commands to add the README file and push it to GitHub:

```bash
git add README.md
git commit -m "Add project README"
git push origin main
```

## License

This project is developed for educational and graduation project purposes.
