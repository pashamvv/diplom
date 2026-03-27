# 🚀 Quick Start - TechStore Frontend

## Быстрый старт за 5 минут

### 1️⃣ Установка (1 минута)

```bash
cd /Users/pavelmamaev/Desktop/design_diplom
npm install
```

### 2️⃣ Конфигурация (1 минута)

```bash
cp .env.example .env
```

**Отредактируйте `.env` файл** (если backend не на localhost:8000):
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 3️⃣ Запуск (1 минута)

```bash
npm start
```

Приложение откроется на **http://localhost:3000** 🎉

---

## 📝 Что нужно сделать на backend

### Минимум для работы

Backend должен иметь на FastAPI:

1. **CORS поддержка** для `http://localhost:3000`
2. **Endpoints** (смотри [BACKEND_GUIDE.md](BACKEND_GUIDE.md)):
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `GET /api/products`
   - И другие (полный список в BACKEND_GUIDE.md)

3. **JWT токены** в ответе: `{ token: "...", user: {...} }`

---

## 🎯 Тестирование функций

### 1. Регистрация и вход
```
Перейти на /register → создать аккаунт → перейти на /login → войти
```

### 2. Каталог товаров
```
Перейти на /catalog → фильтровать товары → добавить в корзину
```

### 3. Корзина
```
Нажать 🛒 в хедере → перейти в /cart → оформить заказ
```

### 4. Админ-панель
```
Войти с ADMIN ролью → увидеть кнопку "Админ-панель" в хедере
```

---

## 📁 Основные файлы для редактирования

### API интеграция
- **`src/api/axiosConfig.js`** - HTTP клиент
- **`src/api/endpoints.js`** - API endpoints (обновите URL если нужно)

### Компоненты
- **`src/components/Header/Header.js`** - верхняя навигация
- **`src/pages/Home/Home.js`** - главная страница

### Стили
- **`src/styles/global.css`** - глобальные стили и переменные цветов

---

## 🎨 Цветовая схема

Основной цвет: **`#2AABEE`** (Telegram Blue)

Все цвета в `src/styles/global.css`:
```css
--primary-color: #2aabee
--primary-dark: #0d96d8
--bg-light: #f9f9f9
```

---

## 🐛 Частые проблемы

### ❌ "Cannot find module 'axios'"
```bash
npm install axios react-router-dom
```

### ❌ Backend не отвечает
Проверьте:
1. Backend запущен на `http://localhost:8000`
2. Переменная в `.env` правильная
3. Backend имеет CORS заголовки

### ❌ "401 Unauthorized" при запросах
Backend вернул ошибку авторизации - проверьте:
1. Токен корректный
2. API endpoint требует аутентификацию
3. Токен добавляется в заголовок `Authorization: Bearer <token>`

---

## 📚 Документация

- **[README.md](README.md)** - полная документация
- **[BACKEND_GUIDE.md](BACKEND_GUIDE.md)** - рекомендации для backend
- **[EXAMPLES.md](EXAMPLES.md)** - примеры кода
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - архитектура проекта

---

## ✅ Готовые функции

- ✅ Header с навигацией
- ✅ Главная страница
- ✅ Каталог с фильтрами и поиском
- ✅ Корзина (сохраняется в localStorage)
- ✅ Login/Register страницы
- ✅ Админ-панель (скрытая, видна только для ADMIN)
- ✅ JWT авторизация
- ✅ Защита маршрутов
- ✅ Адаптивный дизайн
- ✅ CSS стили (без фреймворков)

---

## 🎬 Как получить доступ к админ-панели?

1. В backend создайте пользователя с ролью `ADMIN`
2. Войдите этим пользователем
3. В Header появится кнопка "Админ-панель"
4. Нажмите на неё → перейдёте на `/admin`

---

## 📦 Структура проекта

```
src/
├── api/              # HTTP клиент и endpoints
├── components/       # Переиспользуемые компоненты
├── context/          # React Context для авторизации
├── hooks/            # Custom hooks (useAuth, useCart)
├── pages/            # Страницы приложения
└── styles/           # Глобальные CSS стили
```

---

## 🚀 Для production

```bash
npm run build
```

Создаст оптимизированную версию в папке `build/`

---

## 💡 Советы

1. **Используйте React DevTools** для отладки состояния
2. **Откройте консоль браузера** (F12) для просмотра ошибок
3. **Проверьте Network tab** для отладки API запросов
4. **Читайте EXAMPLES.md** для примеров кода

---

**Всё готово! Начинайте разработку! 🎉**
