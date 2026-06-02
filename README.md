# QolHub

Nidaam kiro guryo ah oo isku xidhaya milkiilayaasha iyo kireystayaasha Somaliland (gaar ahaan Boorama).

## Tech Stack

- **Next.js 16** (App Router) — frontend + API
- **MongoDB** + Mongoose
- **Tailwind CSS**
- **JWT** cookies (auth)

## Bilow

### 1. MongoDB

Ku rakib MongoDB local ama isticmaal [MongoDB Atlas](https://www.mongodb.com/atlas).

### 2. Environment

```bash
cp .env.example .env.local
```

Ku dar:

```
MONGODB_URI=mongodb://127.0.0.1:27017/qolhub
JWT_SECRET=secret-agaaga-oo-adag
```

### 3. Install & Run

```bash
cd qolhub
npm install
npm run dev
```

Fur: http://localhost:3000

### 4. Xogta demo (seed)

Marka MongoDB diyaar yahay:

```bash
curl -X POST http://localhost:3000/api/seed
```

**Akoonnada demo:**

| Role     | Email               | Password      |
|----------|---------------------|---------------|
| Admin    | admin@qolhub.so     | password123   |
| Milkiile | milkiile@qolhub.so  | password123   |
| Kireyste | tenant@qolhub.so    | password123   |

## Qaab-dhismeedka

- `/` — Bogga hore
- `/properties` — List of properties
- `/properties/[id]` — Property details
- `/auth/login`, `/auth/register`
- `/dashboard` — Milkiile (ku dar guri, maamul)
- `/admin` — Maamulaha (ansixinta guryaha)

## Flow-ga nidaamka

1. **Milkiile** wuu is-diiwaan geliyaa → wuxuu ku darayaa guri (banaan oo dhan **ama** qolal banaan guri la dagan)
2. **Admin** wuxuu ansixiyaa guriga (pending → active)
3. **Kireyste** wuxuu raadiyaa guryaha → markuu helo wuu is-diiwaan geliyaa → wuxuu diraa fariin milkiilaha

## Mustaqbalka

- Lacag bixinta (payments)
- Upload sawirro (Cloudinary/S3)
- Fariimaha tooska ah

## Qalin-jabinta

Mashruucan wuxuu xallinayaa dhibaatada helitaanka guryaha Boorama — ardayda jaamacadda iyo dadka soo booqda.
