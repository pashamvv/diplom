# TechStore - Frontend приложение интернет-магазина

React-приложение для интернет-магазина компьютерной техники с поддержкой админ-панели, JWT-авторизацией и полным набором функций e-commerce.

## 🎨 Функциональность

### Для пользователей (USER)
- ✅ Просмотр каталога товаров
- ✅ Поиск товаров по названию
- ✅ Фильтрация по категориям и цене
- ✅ Просмотр информации о товаре
- ✅ Добавление товаров в корзину
- ✅ Управление корзиной
- ✅ Оформление заказов
- ✅ Просмотр истории заказов
- ✅ Аутентификация (регистрация/вход)

### Для администраторов (ADMIN)
- ✅ Панель управления с статистикой
- ✅ Управление товарами (добавление, редактирование, удаление)
- ✅ Управление категориями
- ✅ Управление заказами и их статусами
- ✅ Управление скидками и промо-кодами
- ✅ Просмотр отчётов и статистики
- ✅ Скрытая админ-панель (не отдельный сайт)

## 🛠️ Технологический стек

- **React 19.x** - пользовательский интерфейс
- **React Router 6.x** - маршрутизация
- **Axios** - HTTP-клиент для взаимодействия с API
- **CSS (без фреймворков)** - собственная стилизация

### Дизайн
- Цветовая схема: **#2AABEE** (Telegram Blue)
- Светлый фон, простой и понятный интерфейс
- Полностью адаптивный дизайн

## 📁 Структура проекта

```
src/
├── api/
│   ├── axiosConfig.js        # Конфигурация axios с JWT
│   └── endpoints.js          # API endpoints
├── components/
│   ├── Header/               # Верхняя навигация
│   ├── RequireAuth/          # Защита маршрутов
│   ├── AdminLayout/          # Макет админ-панели
│   ├── ProductCard/          # Карточка товара
│   └── Cart/                 # Компоненты корзины
├── context/
│   └── AuthContext.js        # Контекст авторизации
├── hooks/
│   ├── useAuth.js            # Hook для авторизации
│   └── useCart.js            # Hook для корзины
├── pages/
│   ├── Home/                 # Главная страница
│   ├── Catalog/              # Каталог товаров
│   ├── Cart/                 # Страница корзины
│   ├── Login/                # Вход
│   ├── Register/             # Регистрация
│   ├── Admin/                # Админ-панель (главная)
│   ├── AdminProducts/        # Управление товарами
│   ├── AdminCategories/      # Управление категориями
│   ├── AdminOrders/          # Управление заказами
│   ├── AdminDiscounts/       # Управление скидками
│   └── AdminReports/         # Отчёты
├── styles/
│   └── global.css            # Глобальные стили
├── App.js                    # Основной компонент с маршрутами
└── index.js                  # Entry point
```

## 🚀 Установка и запуск

### 1. Установка зависимостей

```bash
npm install
# или
yarn install
```

### 2. Конфигурация окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и установите URL вашего backend API:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Запуск приложения в режиме разработки

```bash
npm start
# или
yarn start
```

Приложение откроется по адресу [http://localhost:3000](http://localhost:3000)

### 4. Сборка для production

```bash
npm run build
# или
yarn build
```

## 🔐 Аутентификация и авторизация

### Как работает авторизация?

1. Пользователь вводит email и пароль на странице входа
2. Запрос отправляется на backend API (`POST /api/auth/login`)
3. Backend возвращает JWT токен и данные пользователя
4. Токен сохраняется в `localStorage`
5. Токен автоматически добавляется в заголовок `Authorization` для всех запросов
6. При истечении токена (401 ошибка) пользователь перенаправляется на страницу входа

### Файлы для авторизации

- **`src/context/AuthContext.js`** - управление состоянием авторизации
- **`src/hooks/useAuth.js`** - hook для использования auth-контекста
- **`src/components/RequireAuth/RequireAuth.js`** - компонент для защиты маршрутов

## 🔗 Интеграция с Backend API (FastAPI)

### Axios конфигурация

Все запросы идут через централизованный axios-инстанс в `src/api/axiosConfig.js`:

```javascript
// Автоматически добавляет JWT токен
Authorization: Bearer <token>

// Обрабатывает 401/403 ошибки
```

### API Endpoints (ожидаемые от backend)

#### Аутентификация
- `POST /auth/login` - вход (email, password)
- `POST /auth/register` - регистрация (email, password, name)
- `POST /auth/logout` - выход
- `GET /auth/me` - получить данные текущего пользователя

#### Товары
- `GET /products` - список товаров
- `GET /products/:id` - информация о товаре
- `POST /products` - создать товар (ADMIN)
- `PUT /products/:id` - обновить товар (ADMIN)
- `DELETE /products/:id` - удалить товар (ADMIN)

#### Категории
- `GET /categories` - список категорий
- `POST /categories` - создать категорию (ADMIN)
- `PUT /categories/:id` - обновить (ADMIN)
- `DELETE /categories/:id` - удалить (ADMIN)

#### Заказы
- `GET /orders` - список заказов пользователя
- `POST /orders` - создать заказ
- `PATCH /orders/:id` - обновить статус (ADMIN)

#### Корзина
- `GET /cart` - получить корзину
- `POST /cart/items` - добавить товар
- `DELETE /cart/items/:id` - удалить товар
- `PUT /cart/items/:id` - обновить количество

#### Скидки
- `GET /discounts` - список скидок
- `POST /discounts` - создать (ADMIN)
- `DELETE /discounts/:id` - удалить (ADMIN)

#### Отчёты
- `GET /reports/sales` - отчёт по продажам
- `GET /reports/top-products` - топ товаров
- `GET /reports/users` - статистика пользователей

## 🎯 Использование компонентов

### RequireAuth - защита маршрутов

```javascript
<Route
  path="/admin"
  element={
    <RequireAuth requiredRole="ADMIN">
      <AdminPanel />
    </RequireAuth>
  }
/>
```

### useAuth - использование авторизации

```javascript
const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}

if (isAdmin) {
  // Показать админ-кнопку
}
```

### useCart - управление корзиной

```javascript
const { cart, addToCart, removeFromCart, getTotalPrice } = useCart();

// Добавить товар
addToCart(product, quantity);

// Получить сумму
const total = getTotalPrice();
```

## 🎨 Дизайн и стили

### Цветовая схема

- **Основной цвет**: `#2AABEE` (Telegram Blue)
- **Тёмный вариант**: `#0D96D8`
- **Фон**: `#F9F9F9`
- **Белый**: `#FFFFFF`

### CSS переменные

Глобальные переменные находятся в `src/styles/global.css`:

```css
--primary-color: #2aabee;
--bg-light: #f9f9f9;
--text-primary: #333333;
--border-color: #e0e0e0;
```

### Адаптивность

Все компоненты полностью адаптивны для:
- 📱 Мобильные устройства (320px+)
- 📱 Планшеты (768px+)
- 💻 Десктопы (1024px+)

## 📝 Важные файлы

### API и интеграция
- **`src/api/axiosConfig.js`** - конфигурация HTTP-клиента
- **`src/api/endpoints.js`** - все API endpoints

### Состояние приложения
- **`src/context/AuthContext.js`** - управление авторизацией
- **`src/hooks/useAuth.js`** - hook для авторизации
- **`src/hooks/useCart.js`** - hook для корзины

### Главные страницы
- **`src/App.js`** - маршруты приложения
- **`src/pages/Home/Home.js`** - главная страница
- **`src/pages/Catalog/Catalog.js`** - каталог с фильтрами
- **`src/pages/Cart/CartPage.js`** - страница корзины

## 🔧 Переменные окружения

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8000/api
```

## 📦 Команды

```bash
# Установить зависимости
npm install

# Запустить в режиме разработки
npm start

# Собрать для production
npm run build

# Запустить тесты
npm test

# Эжектировать конфигурацию (необратимо!)
npm run eject
```

## 🐛 Решение проблем

### Ошибка "Cannot find module 'axios'"
```bash
npm install axios react-router-dom
```

### Backend не отвечает
Проверьте переменную окружения `REACT_APP_API_URL` в файле `.env`

### CORS ошибки
Убедитесь, что backend настроен с правильными CORS заголовками:
```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📚 Дополнительные ресурсы

- [React документация](https://react.dev)
- [React Router docs](https://reactrouter.com/)
- [Axios docs](https://axios-http.com/)

## 👤 Автор

TechStore Frontend - Разработано для курсовой работы

---

**Готово к использованию! 🚀**
