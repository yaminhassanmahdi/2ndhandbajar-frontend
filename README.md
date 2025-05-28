
# 2ndhandbajar.com - Online Marketplace

This is a Next.js application for 2ndhandbajar.com, an online marketplace for buying and selling second-hand goods. This version is a prototype and uses mock data.

## Getting Started

This project is built with Next.js and TypeScript, utilizing ShadCN UI components and Tailwind CSS for styling.

To get started with development:

1.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002` (or the port specified in `package.json`).

## Core Features (Prototype)

*   **Product Browsing**: Users can browse products with filtering by category/brand.
*   **Shopping Cart**: Users can add products to their cart and proceed to checkout.
*   **User Authentication**: Mock user login/registration with email/phone and Google Sign-In.
*   **Product Listing**: Users can upload and list their own products for sale (admin approval).
*   **Admin Panel**:
    *   Product approval queue.
    *   Management of categories, sub-categories, and category-specific attributes.
    *   Order management (view details, update status, update payment status).
    *   Location management (view predefined locations, manage delivery charges, shipping methods).
    *   Financials (withdrawal request processing, commission setting, cash-in-hand view).
    *   General settings (business branding, homepage banners, custom pages, Google login config).
    *   User management (view user details).
*   **Shipping Address Input**: Users can set their shipping address during checkout and in account settings.
*   **Order Tracking**: Buyers can view their order status in their account.
*   **Seller Earnings & Withdrawals**: Sellers can view earnings and request withdrawals.

## Tech Stack

*   **Frontend:**
    *   Language: TypeScript
    *   Framework: Next.js (v15) with App Router
    *   UI Library: React (v18)
    *   UI Components: ShadCN UI
    *   Styling: Tailwind CSS
    *   Icons: Lucide React
*   **Backend (Prototype):**
    *   Runtime: Next.js (Node.js environment) for Server Components and mock data handling.
    *   No dedicated external database is currently integrated.
*   **AI (Potential):**
    *   Genkit (if AI features are implemented).

## Data Management (Current Prototype)

*   **Mock Data:** Most application data (products, users, orders, initial categories, locations) is sourced from static arrays defined in `src/lib/mock-data.ts` and `src/lib/constants.ts`. This data is **in-memory** and will reset when the development server restarts.
*   **`localStorage`:** Admin-configurable settings (e.g., delivery charges, commission percentages, business settings, dynamic categories, banners, custom pages, shipping methods, attribute types/values) and user-specific data (like `currentUser`, `cartItems`) are persisted in the browser's `localStorage`. This means:
    *   Data is specific to the browser instance.
    *   Data is not shared between users or across different browsers/devices.
    *   Clearing browser data will erase these settings and user sessions.

**This data management approach is suitable for prototyping and local development ONLY.**

## Security Considerations (Current Prototype)

*   **NOT PRODUCTION READY:** The current version of this application is **NOT secure** and should **NOT** be deployed to a public environment or used with real, sensitive data.
*   **Authentication:** The authentication system is a mock implementation. User credentials are checked against in-memory data, and there is no secure password hashing or robust session management.
*   **Authorization:** Admin panel access is based on a simple `isAdmin` flag in the mock user data. There are no comprehensive authorization checks for specific admin actions.
*   **Data Storage:** Using `localStorage` for settings and mock arrays for core data is inherently insecure for a real application.

## Future Work: Towards a Production-Ready Application

To make this application production-ready, the following key areas need to be addressed:

1.  **Backend & Database Integration:**
    *   Implement a robust backend (e.g., using Node.js/Express, Python/Django, or a BaaS like Firebase/Supabase).
    *   Set up a persistent database (e.g., PostgreSQL, MongoDB, Firebase Firestore).
    *   Create API endpoints for all data operations (CRUD for products, users, orders, settings, etc.).
    *   Replace all mock data and `localStorage` interactions with API calls to this backend.
2.  **Secure Authentication & Authorization:**
    *   Integrate a secure authentication system (e.g., JWT, OAuth 2.0).
    *   Implement proper password hashing and storage.
    *   Develop role-based access control (RBAC) for admin functionalities.
3.  **Payment Gateway Integration:** For handling real financial transactions.
4.  **Image & File Management:** Implement secure image/file uploads and storage (e.g., using AWS S3, Google Cloud Storage, Firebase Storage).
5.  **Security Hardening:** Address common web vulnerabilities (XSS, CSRF, etc.).
6.  **Scalable Deployment:** Choose and configure a suitable hosting solution (e.g., Vercel, AWS, Google Cloud).

## Project Structure

*   `src/app/`: Contains all the pages and layouts for the Next.js App Router.
    *   `src/app/admin/`: Admin panel specific pages and layouts.
    *   `src/app/api/`: (If used) For Next.js API route handlers.
*   `src/components/`: Reusable UI components.
    *   `src/components/ui/`: ShadCN UI components.
    *   `src/components/admin/`: Components specific to the admin panel.
*   `src/contexts/`: React Context providers (e.g., AuthContext, CartContext).
*   `src/hooks/`: Custom React hooks (e.g., `useLocalStorage`, `useToast`).
*   `src/lib/`: Utility functions, type definitions, constants, and mock data.
*   `src/ai/`: Genkit AI related files (if used).
```# 2ndhandbajar-frontend
