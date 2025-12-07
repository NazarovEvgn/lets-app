 # Терминал 1: Docker сервисы (PostgreSQL + Redis)
  docker-compose up -d

  # Проверка что контейнеры запустились
  docker ps

  # Терминал 2: Backend API
  cd api
  uv run python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

  Backend будет доступен:
  - API: http://localhost:8000
  - API Docs: http://localhost:8000/docs

  ---
  2️⃣ Запуск Business App (Админка для бизнеса)

  # Терминал 3: Business приложение
  cd business
  npm run dev

  Business приложение будет доступно:
  - http://localhost:5173

  ---
  🔍 Проверка что все работает:

  # Проверка Docker
  docker ps
  # Должно показать: lets_postgres (healthy), lets_redis (healthy)

  # Проверка Backend
  curl http://localhost:8000/health

  # Проверка Business App
  # Открыть браузер: http://localhost:5173

  ---
  Тестовые учетки для входа:
  - familia.mendeleeva@example.com / Familia123
  - familia.charkova@example.com / Familia123
  - hollywood.salon@example.com / Hollywood123