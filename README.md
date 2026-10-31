# Campus Pulse

Campus Pulse is a lightweight, responsive college notice management web application that converts unstructured college announcements into organized, searchable notices.

## Tech Stack

- **Frontend:** React + Vite, Custom CSS (warm cream & forest green palette), Lucide React
- **Backend:** FastAPI, Python 3, Pydantic, PyMongo
- **Database:** MongoDB Atlas / MongoDB
- **AI Integration:** External AI API for notice extraction and summaries

---

## Getting Started

### Prerequisites

- Node.js (v18+) & npm
- Python (3.10+)
- MongoDB Atlas cluster or local MongoDB instance

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # macOS / Linux:
   source .venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your MongoDB connection string and AI API key:
   - `MONGODB_URI`: Your MongoDB connection URI (e.g., `mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority` for MongoDB Atlas).
   - `MONGODB_DATABASE`: Database name (e.g., `campus_pulse`).
   - `AI_API_KEY`: Your external AI API key.

5. Initialize database collection indexes:
   ```bash
   python -m app.database.init_db
   ```

6. Run automated test suite:
   ```bash
   pytest app/tests
   ```

7. Run the backend development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API health check will be available at: `http://localhost:8000/api/v1/health`

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:5173`

4. Build for production:
   ```bash
   npm run build
   ```

---

## Project Structure

```text
CAMPUS_PULSE_040/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── init_db.py
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tests/
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```
