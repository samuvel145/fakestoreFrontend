# Gap Analysis & Additional Development Required
## eCommerce App — Manager Feedback Response

**Based on:** Full analysis of `docs-data.json` (OpenAPI 3.1 spec) + fakestoreapi.com live API  
**Date:** March 2026  
**Status:** Phase 2 — What was missed in Phase 1

---

## What the Manager Is Right About

Your current app only uses **3 of the 4 API groups** available in Fake Store API.

| API Group | Phase 1 Status | Manager's Complaint |
|---|---|---|
| 🛒 Products | ✅ Done | — |
| 🔒 Auth (Login) | ❌ Missing | "Why is there no login page?" |
| 🛍️ Carts | ❌ Missing | "Why is there no API connection for cart?" |
| 👤 Users | ❌ Missing | "Frontend should connect with backend and work" |

---

## Full API Inventory (from your docs-data.json)

### 🔒 Auth Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| POST | `/auth/login` | Authenticates user, returns a JWT token |

**Request body:**
```json
{ "username": "john_doe", "password": "pass123" }
```
**Response:**
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

---

### 👤 User Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/users` | Get all users |
| GET | `/users/{id}` | Get single user profile |
| POST | `/users` | Register a new user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

**User object schema:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "password": "pass123"
}
```

---

### 🛍️ Cart Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/carts` | Get all carts |
| GET | `/carts/{id}` | Get single cart |
| GET | `/carts/user/{userId}` | Get all carts for a specific user |
| POST | `/carts` | Create a new cart |
| PUT | `/carts/{id}` | Update a cart |
| DELETE | `/carts/{id}` | Delete a cart |

**Cart object schema:**
```json
{
  "id": 1,
  "userId": 3,
  "products": [
    { "productId": 5, "quantity": 3 },
    { "productId": 1, "quantity": 2 }
  ]
}
```

---

## What Needs to Be Built (Phase 2)

### New Files Required

```
src/
├── pages/
│   ├── LoginPage.jsx          ← NEW
│   └── ProfilePage.jsx        ← NEW (optional but expected)
├── context/
│   └── AuthContext.jsx        ← NEW (replaces/supplements CartContext)
├── hooks/
│   └── useAuth.js             ← NEW
├── components/
│   └── ProtectedRoute.jsx     ← NEW (guards /cart and /checkout)
└── utils/
    └── api.js                 ← NEW (centralized API calls with token)
```

---

## What Changes in Existing Files

| File | Change Required |
|---|---|
| `App.jsx` | Add `/login` route, wrap protected routes with ProtectedRoute |
| `CartContext.jsx` | Replace localStorage-only logic with API cart calls |
| `CheckoutPage.jsx` | Send cart to API on order placement |
| `Navbar.jsx` | Show username + logout button when logged in |

---

## Important Caveat About Fake Store API

> ⚠️ **Fake Store API does NOT actually persist data.**
> POST/PUT/DELETE to `/carts`, `/users`, and `/auth/login` will return a valid response
> with a fake ID or token, but **nothing is stored server-side between requests**.
> This is expected behaviour for a mock/test API — it is designed to simulate real backend
> behaviour for frontend development only.

What this means practically:
- Login will return a real JWT token format — store it and use it
- Cart POST will return `{ id: 11, userId: ..., products: [...] }` — treat it as if it's saved
- You **cannot** GET back a cart you just POSTed — the API resets
- This is fine for demo/interview/portfolio purposes

---

---

# Step-by-Step IDE Prompts — Phase 2

> Copy each prompt into your AI IDE (Cursor / Windsurf / Copilot) one at a time.
> Complete Phase 1 before starting Phase 2.

---

## STEP A — Centralized API Utility

### Prompt A.1 — Create api.js Utility

```
Create src/utils/api.js — a centralized API utility for all Fake Store API calls.

Requirements:
- Define BASE_URL = import.meta.env.VITE_API_BASE_URL
- Create a helper function called apiCall(endpoint, options = {}) that:
  - Builds the full URL from BASE_URL + endpoint
  - Automatically adds Authorization header: "Bearer {token}" if a token exists in localStorage under key "token"
  - Always sets Content-Type: application/json
  - Throws an error if response.ok is false, with the status code in the message
  - Returns parsed JSON
- Export these named async functions using apiCall:

  AUTH:
  - login(username, password) → POST /auth/login → returns { token }

  USERS:
  - getUser(id) → GET /users/{id} → returns user object
  - registerUser(userData) → POST /users → returns created user

  CARTS:
  - getUserCart(userId) → GET /carts/user/{userId} → returns array of carts
  - createCart(userId, products) → POST /carts → body: { userId, date, products: [{productId, quantity}] }
  - updateCart(cartId, userId, products) → PUT /carts/{cartId}
  - deleteCart(cartId) → DELETE /carts/{cartId}

All functions should be async and use apiCall internally.
Export all as named exports. No default export.
```

---

## STEP B — Auth Context & Hook

### Prompt B.1 — AuthContext

```
Create src/context/AuthContext.jsx — global authentication state management.

Requirements:
- Create AuthContext with createContext
- Build AuthProvider component
- On mount, read from localStorage:
  - key "token" → JWT string
  - key "userId" → user ID number
  - key "username" → username string
- State: { token, userId, username, isAuthenticated }
  - isAuthenticated = true if token exists
- Expose these via context:
  1. login(username, password):
     - Calls the login() function from src/utils/api.js
     - On success: stores token in localStorage under "token"
     - Also calls getUser(1) to get the user profile (for demo: Fake Store API 
       always returns same token regardless of user, so use userId=1 as default 
       or parse from token if possible)
     - Stores userId and username in localStorage
     - Updates state
     - Returns { success: true }
     - On failure: returns { success: false, error: message }
  2. logout():
     - Clears token, userId, username from localStorage
     - Resets state to unauthenticated
  3. isAuthenticated (boolean)
  4. username (string)
  5. userId (number)

- Export AuthProvider as default
- Export useAuth hook (throws if used outside provider)

Note: Wrap the existing CartProvider inside AuthProvider in App.jsx
```

---

### Prompt B.2 — ProtectedRoute Component

```
Create src/components/ProtectedRoute.jsx.

Requirements:
- Accepts a children prop
- Calls useAuth to check isAuthenticated
- If isAuthenticated is false:
  - Redirect to "/login" using React Router's <Navigate replace />
  - Pass the current location as state so we can redirect back after login:
    <Navigate to="/login" state={{ from: location }} replace />
  - Use useLocation to get current location
- If isAuthenticated is true: render children normally

Export as default.
```

---

## STEP C — Login Page

### Prompt C.1 — LoginPage

```
Create src/pages/LoginPage.jsx — the user login page.

Requirements:
1. If already authenticated (useAuth), redirect to "/" immediately
2. Layout: centered card on screen (min-h-screen, flex, items-center, justify-center, bg-gray-50)
3. Card: white, rounded-xl, shadow-lg, p-8, w-full max-w-md
4. Header: App logo/name "ShopReact" (indigo, bold, large) centered at top
5. Subheading: "Sign in to your account"

6. Form fields (controlled with useState):
   - Username input (type="text", placeholder="Enter your username")
   - Password input (type="password", placeholder="Enter your password")
   - Both styled: full width, border, rounded-lg, p-3, focus ring indigo

7. Demo credentials hint box (light blue bg):
   - Text: "Demo credentials: username: johnd / password: m38rmF$"
   - This is a real Fake Store API test account

8. "Sign In" button:
   - Full width, indigo, large
   - Shows loading spinner text while submitting (isLoading state)
   - On submit:
     a. Validate fields are not empty
     b. Call login(username, password) from useAuth
     c. On success: navigate to the page they came from (location.state?.from) or "/"
     d. On failure: show error message in red below the button

9. Below the form: "Don't have an account? Register" link (links to "/register" — stub for now)

Export as default.
```

---

## STEP D — Cart API Integration

### Prompt D.1 — Update CartContext to Use Cart API

```
Update src/context/CartContext.jsx to integrate with the Fake Store API cart endpoints.

Current behaviour: cart is only in localStorage.
New behaviour: cart is synced with the API when user is logged in.

Requirements:
1. Import useAuth from AuthContext — get { userId, isAuthenticated }
2. Import { getUserCart, createCart, updateCart } from src/utils/api.js

3. New cart initialization logic (runs on mount and when isAuthenticated changes):
   - If isAuthenticated:
     a. Call getUserCart(userId)
     b. The API returns an array of cart objects — take the first one (most recent)
     c. Each cart has products: [{ productId, quantity }] — but NOT product details
     d. For each productId, fetch the product details from /products/{id}
     e. Merge to build the full cart items array: [{ id, title, price, image, quantity }]
     f. Set this as the cart state
     g. Store the cartId from the API response in state (needed for PUT)
   - If not authenticated: load from localStorage as before

4. New syncCartToAPI(cartItems) function:
   - Called after every addToCart, removeFromCart, updateQuantity
   - Only runs if isAuthenticated
   - Converts cartItems to API format: products: cartItems.map(i => ({ productId: i.id, quantity: i.quantity }))
   - If cartId exists: call updateCart(cartId, userId, products)
   - If no cartId yet: call createCart(userId, products) and save returned cartId

5. Keep localStorage sync working as fallback when not authenticated

6. Expose cartId in context (useful for debugging)

Important note to developer: Fake Store API is a mock API. 
GET /carts/user/{id} will return pre-seeded fake data (not your actual POSTed cart).
The sync is still valuable for demonstrating the API integration pattern.
Handle the case where the fetched product IDs don't match real products gracefully.

Export CartProvider as default. Keep useCart hook.
```

---

## STEP E — Update Routing

### Prompt E.1 — Update App.jsx with Auth + Protected Routes

```
Update src/App.jsx to add authentication routing and protected routes.

Changes required:
1. Import AuthProvider from src/context/AuthContext.jsx
2. Import ProtectedRoute from src/components/ProtectedRoute.jsx
3. Import LoginPage from src/pages/LoginPage.jsx
4. Wrap CartProvider inside AuthProvider (AuthProvider is outermost):
   <AuthProvider>
     <CartProvider>
       ...
     </CartProvider>
   </AuthProvider>

5. Add new routes:
   - "/login" → LoginPage (public)
   - "/register" → simple stub page (just "Coming Soon" text) (public)

6. Wrap these routes with ProtectedRoute:
   - "/cart" → ProtectedRoute → CartPage
   - "/checkout" → ProtectedRoute → CheckoutPage
   - "/order-confirm" → ProtectedRoute → OrderConfirmPage

Public routes (no protection needed):
   - "/" → HomePage
   - "/product/:id" → ProductDetailPage
   - "/login" → LoginPage

Show the complete updated App.jsx.
```

---

## STEP F — Update Navbar for Auth State

### Prompt F.1 — Navbar Auth UI

```
Update src/components/Navbar.jsx to show authentication state.

Changes required:
1. Import useAuth from AuthContext
2. Get { isAuthenticated, username, logout } from useAuth

3. Right side of Navbar — conditional rendering:
   
   If NOT authenticated:
   - Show "Login" button/link → navigates to "/login"
   - Style: outlined indigo button (border border-indigo-600 text-indigo-600 hover:bg-indigo-50)
   
   If authenticated:
   - Show: "Hi, {username}" text (text-sm text-gray-600)
   - Cart icon with badge (existing)
   - "Logout" button:
     - On click: calls logout() from useAuth, then navigates to "/login"
     - Style: text button, text-gray-500 hover:text-red-500

4. Keep the cart badge logic exactly as before

Show the complete updated Navbar.jsx.
```

---

## STEP G — Profile Page (Optional but Expected)

### Prompt G.1 — UserProfilePage

```
Create src/pages/ProfilePage.jsx — displays the logged-in user's profile.

Requirements:
1. Protected page — wrap in ProtectedRoute in App.jsx (add route "/profile")
2. On mount: fetch user data using getUser(userId) from api.js
   - userId comes from useAuth
3. Display:
   - Page heading: "My Profile"
   - User info card (white, shadow, rounded):
     - Name: user.name.firstname + user.name.lastname
     - Username: user.username
     - Email: user.email
     - Phone: user.phone
     - Address: user.address.street, user.address.city, user.address.zipcode
4. Below profile: "My Cart History" section
   - Fetch getUserCart(userId)
   - Show each cart as a summary card:
     - Cart ID
     - Date
     - Number of products
5. Loading state: spinner while fetching
6. Error state: show ErrorMessage

Add "/profile" route in App.jsx wrapped in ProtectedRoute.
Add "My Profile" link in Navbar when authenticated (between username and logout).

Export as default.
```

---

## STEP H — Checkout with Cart API

### Prompt H.1 — Update Checkout to Delete Cart on Order

```
Update src/pages/CheckoutPage.jsx — connect checkout to the cart API.

Changes on "Place Order" click:
1. Get cartId and clearCart from useCart
2. Get isAuthenticated from useAuth
3. If isAuthenticated AND cartId exists:
   - Call deleteCart(cartId) from api.js (simulates order being placed and cart cleared)
   - On success: proceed to clear local cart and navigate
   - On failure: show error but still allow local cart clear
4. Always: call clearCart() to clear localStorage and local state
5. Save order summary to sessionStorage as before
6. Navigate to "/order-confirm"

Show loading state on the "Place Order" button while the API call is in progress.

Show the updated handlePlaceOrder function and the button with loading state.
```

---

## STEP I — Final Verification

### Prompt I.1 — Full Auth + Cart API Verification Checklist

```
Review my complete updated eCommerce app and verify this Phase 2 checklist.
For each item, tell me pass ✅ or fail ❌ with the file and line to fix:

AUTH FLOW
[ ] Unauthenticated user visiting "/" sees products (public, no redirect)
[ ] Unauthenticated user clicking cart icon → redirects to "/login"
[ ] Login page shows demo credentials hint
[ ] Login with correct credentials (johnd / m38rmF$) → gets token → redirects home
[ ] Login with wrong credentials → shows error message, no crash
[ ] After login, Navbar shows "Hi, johnd" and Logout button
[ ] Logout clears token from localStorage and redirects to "/login"
[ ] Refreshing page while logged in → stays logged in (token in localStorage)
[ ] Direct URL to "/cart" while logged out → redirects to "/login"
[ ] After login redirect, user lands on the page they were trying to visit

CART API INTEGRATION
[ ] After login, cart fetches from GET /carts/user/{userId}
[ ] Adding a product calls syncCartToAPI (POST or PUT /carts)
[ ] Cart items are shown with correct product details (title, price, image)
[ ] localStorage cart still works as fallback when logged out
[ ] Placing order calls DELETE /carts/{cartId} (or PUT with empty products)
[ ] Cart clears locally after order is placed

USER PROFILE
[ ] "/profile" route is protected
[ ] Profile page shows real user data from GET /users/{userId}
[ ] Cart history section fetches from GET /carts/user/{userId}

NAVBAR
[ ] Logged out: shows Login button
[ ] Logged in: shows username, cart icon with badge, logout button
[ ] Logout button works and clears all auth state

API UTILITY
[ ] All API calls go through src/utils/api.js
[ ] Token is automatically attached to requests when available
[ ] Errors are caught and surfaced in the UI (not just console.log)

List all failures with exact file, function, and fix needed.
```

---

## Complete Updated File Structure (Phase 1 + Phase 2)

```
src/
├── components/
│   ├── Navbar.jsx              ← UPDATED (auth state, logout)
│   ├── ProductCard.jsx
│   ├── CartItem.jsx
│   ├── LoadingSpinner.jsx
│   ├── ErrorMessage.jsx
│   ├── ScrollToTop.jsx
│   └── ProtectedRoute.jsx     ← NEW
├── context/
│   ├── AuthContext.jsx        ← NEW
│   └── CartContext.jsx        ← UPDATED (API sync)
├── hooks/
│   ├── useFetch.js
│   └── useAuth.js             ← (inside AuthContext, exported)
├── pages/
│   ├── HomePage.jsx
│   ├── ProductDetailPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx       ← UPDATED (cart API delete)
│   ├── OrderConfirmPage.jsx
│   ├── LoginPage.jsx          ← NEW
│   └── ProfilePage.jsx        ← NEW
├── utils/
│   ├── formatPrice.js
│   └── api.js                 ← NEW (centralized API calls)
├── App.jsx                    ← UPDATED (routes + auth wrapping)
├── main.jsx
└── index.css
```

---

## Complete Updated Route Map

| Route | Page | Auth Required |
|---|---|---|
| `/` | HomePage | ❌ Public |
| `/product/:id` | ProductDetailPage | ❌ Public |
| `/login` | LoginPage | ❌ Public (redirects if already logged in) |
| `/register` | RegisterPage (stub) | ❌ Public |
| `/cart` | CartPage | ✅ Protected |
| `/checkout` | CheckoutPage | ✅ Protected |
| `/order-confirm` | OrderConfirmPage | ✅ Protected |
| `/profile` | ProfilePage | ✅ Protected |

---

## Demo Credentials (Fake Store API — Real Test Account)

```
Username: johnd
Password: m38rmF$
```

> These are pre-seeded in the Fake Store API database.
> Login will return a real JWT token. Use this in your demo.

---

*Phase 2 adds Auth, Cart API, and User API integration — addressing all three manager complaints.*
*Follow prompts A → I in order. Do not skip steps.*
