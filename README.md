# CasaBella – Tablecloth Store with an AI Table-Cover Finder

A full-stack online store for tablecloths (browse, cart, checkout, admin product management),
extended with an **AI-driven finder**: the customer picks a category and sub-category, describes the
tablecloth she is looking for, and the AI recommends matching products from the store.
Every request and answer is saved, so each customer has a search history and the admin can review everyone's.

The finder was built as a mini MVP following the *"AI-Driven Learning Platform"* brief, with the same architecture
(categories → sub-categories → prompt → AI response → history → admin dashboard), adapted to this store's domain:
instead of generating lessons, the AI recommends products from the catalog.

## Features

**Store (existing)**
- Product catalog, shopping cart, checkout and order history
- Registration / login with JWT
- Admin: add, edit and delete products, view all orders

**AI table-cover finder (new)**
- Choose a category and sub-category (e.g. *Table shape › Round*)
- Describe what you want, e.g. "a round beige tablecloth up to 300 ILS"
- The AI answers with a short explanation and up to 3 products from the store, with "add to cart"
- Personal search history for each logged-in user
- Admin dashboard: all users (name, email, phone) with their prompt history, search and pagination
- Phone number field in registration

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Redux Toolkit, Material UI, react-hook-form, axios |
| Backend | Node.js, Express 5, Mongoose, Joi, JWT, bcryptjs, multer |
| Database | MongoDB (Docker Compose file included) |
| AI | OpenAI Chat Completions API, or a built-in Mock provider (default) |

## Project structure

```
.
├── docker-compose.yml          # MongoDB for local development
├── CasaBella-Server
│   ├── app.js
│   ├── config/                 # database connection
│   ├── middleware/             # auth (JWT), admin check, image upload
│   ├── models/                 # user, product, order, category, subcategory, prompt
│   ├── controllers/            # request handling (incl. assistant.controller.js)
│   ├── routes/                 # route definitions (incl. assistant.route.js)
│   ├── services/aiService.js   # AI provider interface: Mock + OpenAI
│   ├── seed/                   # categories, admin user, products
│   └── uploads/                # product images
└── CasaBella-Client
    └── src
        ├── app/                # Redux store
        ├── components/         # Navbar
        ├── features/           # products, cart, orders, auth, assistant
        └── services/           # API calls (auth, assistant)
```

## Getting started

**Prerequisites:** Node.js 18+ and MongoDB (local installation, or Docker).

### 1. Database
```bash
docker compose up -d
```
(Skip this if you already run MongoDB locally on port 27017.)

### 2. Server
```bash
cd CasaBella-Server
cp .env.example .env        # Windows PowerShell: copy .env.example .env
npm install
npm run seed                # categories + admin user + products
npm run dev                 # http://localhost:5000
```

### 3. Client
```bash
cd CasaBella-Client
npm install
npm run dev                 # http://localhost:5173
```

The client expects the API at `http://localhost:5000`.

### Admin login
`npm run seed` creates an admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your `.env`
(running it again resets that user's password). Log in with those credentials to see
"Add product", "Orders" and "Customers' searches" in the menu.

### Environment variables (`CasaBella-Server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign tokens (required) |
| `AI_PROVIDER` | `mock` (default) or `openai` |
| `OPENAI_API_KEY` | Needed only when `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | Optional, default `gpt-4o-mini` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used by `npm run seed` to create the admin |

## AI integration

All AI access goes through one function, `recommendProducts()` in `services/aiService.js`,
with two interchangeable providers:

- **Mock (default, no API key needed):** keyword matching against product names, with basic Hebrew
  word-ending handling and a budget filter ("עד 300"). If nothing matches, it returns a few catalog items.
- **OpenAI:** set `AI_PROVIDER=openai` and `OPENAI_API_KEY`. The server sends the customer's request together with the
  catalog (id, name, price) and asks for JSON. The answer is validated: only product ids that really exist in the
  store are kept, the request has a 20 second timeout, and failures return a clean 502 error.

## API

Authentication: JWT sent in the `x-auth-token` header.

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/assistant/categories` | Public | List categories |
| GET | `/api/assistant/categories/:categoryId/sub-categories` | Public | Sub-categories of a category |
| POST | `/api/assistant/prompts` | User | Body: `categoryId`, `subCategoryId`, `prompt`. Returns the saved answer with recommended products |
| GET | `/api/assistant/prompts/me` | User | The logged-in user's history |
| GET | `/api/assistant/admin/users?page=&limit=&search=` | Admin | Users with their prompts (paginated, searchable) |
| POST | `/api/users/register`, `/api/users/login` | Public | Registration and login |
| GET | `/api/products` | Public | Product list (POST / PUT / DELETE are admin only) |
| — | `/api/orders` | User / Admin | Checkout and orders |

## Data model

| Collection | Fields |
|---|---|
| `users` | id, name, email, password (hashed), phone, isAdmin |
| `categories` | id, name |
| `sub_categories` | id, name, category_id |
| `prompts` | id, user_id, category_id, sub_category_id, prompt, response, recommendedProducts, created_at |

Relations use Mongoose references. A sub-category is unique within its category, and the server checks that the
chosen sub-category belongs to the chosen category.

## Validation, errors and security

- Request bodies are validated with Joi; invalid ids and bad input return `400`, unknown items `404`
- Prompt length is limited to 5–500 characters (client and server)
- Errors are returned as `{ "message": ... }`; unexpected server errors do not leak internals
- Passwords are hashed with bcrypt; the admin list never returns passwords
- Registration cannot create an admin: the `isAdmin` field is not accepted from the request
- The admin search escapes user input before building a regular expression
- No secrets in the repository: `.env` is ignored and `.env.example` documents all variables

## Assumptions

- The customer description is free text, and categories and sub-categories only give the AI context
- The existing store user is also the user of the finder (the `users` table gained a `phone` field)
- Without an OpenAI key the app runs in Mock mode, so it works out of the box
- Registered users and orders are not part of the repository; the admin and the products are created by the seed scripts

## Not included

Automated tests, Swagger / OpenAPI documentation, TypeScript and a deployed demo.