# ⚙️ AI QuantSim – Frontend Setup Guide

This guide helps you set up the React + Vite + TailwindCSS frontend environment from scratch.

---

## 🧰 Prerequisites

- Node.js (v18 or higher recommended)
- npm

---

## 🚀 Setup Steps

1. **Clone the repo**

```bash
git clone https://github.com/your-org/ai-quantsim-client.git
cd ai-quantsim-client
```

2. **Install dependencies**

```bash
npm install
```

3. **Install TailwindCSS (if not already installed)**

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

4. **Create config files**

If missing, manually add:

**tailwind.config.js**
```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

**postcss.config.js**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. **Create `.env` file**

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

6. **Run the development server**

```bash
npm run dev
```

App will run at: [http://localhost:5173](http://localhost:5173)

---
