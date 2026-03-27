# 📁 Структура проекта TechStore Frontend

```
design_diplom/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── api/
│   │   ├── axiosConfig.js          # ✅ Конфигурация axios с JWT
│   │   └── endpoints.js            # ✅ Все API endpoints
│   │
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.js           # ✅ Верхняя навигация с логотипом
│   │   │   └── Header.css          # ✅ Стили Header
│   │   ├── RequireAuth/
│   │   │   └── RequireAuth.js      # ✅ Компонент защиты маршрутов
│   │   ├── AdminLayout/
│   │   │   ├── AdminLayout.js      # ✅ Макет админ-панели с сайдбаром
│   │   │   └── AdminLayout.css     # ✅ Стили AdminLayout
│   │   ├── ProductCard/
│   │   │   ├── ProductCard.js      # ✅ Карточка товара
│   │   │   └── ProductCard.css     # ✅ Стили карточки
│   │   └── Cart/                   # Компоненты корзины
│   │
│   ├── context/
│   │   └── AuthContext.js          # ✅ Контекст авторизации (AuthProvider)
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # ✅ Hook для использования AuthContext
│   │   └── useCart.js              # ✅ Hook для управления корзиной
│   │
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.js             # ✅ Главная страница
│   │   │   └── Home.css            # ✅ Стили
│   │   ├── Catalog/
│   │   │   ├── Catalog.js          # ✅ Каталог с фильтрами
│   │   │   └── Catalog.css         # ✅ Стили
│   │   ├── Product/                # Карточка товара
│   │   ├── Cart/
│   │   │   ├── CartPage.js         # ✅ Страница корзины
│   │   │   └── CartPage.css        # ✅ Стили
│   │   ├── Orders/                 # История заказов пользователя
│   │   ├── Login/
│   │   │   ├── Login.js            # ✅ Форма входа
│   │   │   └── Login.css           # ✅ Стили
│   │   ├── Register/
│   │   │   ├── Register.js         # ✅ Форма регистрации
│   │   │   └── Register.css        # ✅ Стили
│   │   ├── Admin/
│   │   │   └── AdminDashboard.js   # ✅ Главная админ-панель
│   │   ├── AdminProducts/
│   │   │   └── AdminProducts.js    # ✅ Управление товарами
│   │   ├── AdminCategories/
│   │   │   └── AdminCategories.js  # ✅ Управление категориями
│   │   ├── AdminOrders/
│   │   │   └── AdminOrders.js      # ✅ Управление заказами
│   │   ├── AdminDiscounts/
│   │   │   └── AdminDiscounts.js   # ✅ Управление скидками
│   │   ├── AdminReports/
│   │   │   └── AdminReports.js     # ✅ Отчёты
│   │   └── Admin.css               # ✅ Общие стили для админ-страниц
│   │
│   ├── styles/
│   │   └── global.css              # ✅ Глобальные стили и CSS переменные
│   │
│   ├── App.js                      # ✅ Основной компонент с маршрутами
│   ├── App.css                     # ✅ Стили App
│   └── index.js                    # ✅ Entry point (React 18)
│
├── .env                            # Переменные окружения (создать из .env.example)
├── .env.example                    # ✅ Пример переменных окружения
├── .gitignore                      # Git исключения
├── package.json                    # ✅ Зависимости и scripts
├── package-lock.json               # Lockfile
├── README.md                       # ✅ Основная документация
├── BACKEND_GUIDE.md                # ✅ Рекомендации для backend разработчика
├── EXAMPLES.md                     # ✅ Примеры использования компонентов
└── ARCHITECTURE.md                 # Этот файл
```

## 📊 Статистика проекта

### Созданные файлы
- **JavaScript файлы**: ~25
- **CSS файлы**: ~8
- **Документация**: 3
- **Всего строк кода**: ~2500+

### Функциональные модули

#### 🔐 Авторизация
- [x] JWT токены
- [x] Login/Register
- [x] AuthContext
- [x] Защита маршрутов
- [x] Проверка прав доступа

#### 🛍️ Каталог и товары
- [x] Список товаров
- [x] Фильтрация по категориям
- [x] Фильтрация по цене
- [x] Поиск товаров
- [x] Карточки товаров

#### 🛒 Корзина и заказы
- [x] Добавление в корзину
- [x] Управление количеством
- [x] Удаление товаров
- [x] Подсчёт суммы
- [x] Оформление заказа

#### 👨‍💼 Админ-панель
- [x] Управление товарами
- [x] Управление категориями
- [x] Управление заказами
- [x] Управление скидками
- [x] Отчёты и статистика
- [x] Защита доступа по ролям

#### 🎨 Дизайн
- [x] CSS стили (без фреймворков)
- [x] Адаптивный дизайн
- [x] Цветовая схема Telegram
- [x] Темные/светлые режимы готовы

## 🚀 Как запустить проект

### Шаг 1: Установка зависимостей
```bash
cd /Users/pavelmamaev/Desktop/design_diplom
npm install
```

### Шаг 2: Создание .env файла
```bash
cp .env.example .env
# Отредактировать REACT_APP_API_URL если нужно
```

### Шаг 3: Запуск dev сервера
```bash
npm start
```

Приложение откроется на `http://localhost:3000`

## 📋 Маршруты приложения

### Публичные маршруты
```
/                          Главная страница
/catalog                   Каталог товаров
/catalog?search=query      Поиск товаров
/catalog?category=123      Фильтр по категории
/product/:id               Карточка товара
/cart                      Корзина
/login                     Вход
/register                  Регистрация
```

### Защищённые маршруты (USER)
```
/orders                    Мои заказы
/profile                   Профиль пользователя
```

### Админ маршруты (ADMIN только)
```
/admin                     Панель управления (главная)
/admin/products            Управление товарами
/admin/categories          Управление категориями
/admin/orders              Управление заказами
/admin/discounts           Управление скидками
/admin/reports             Отчёты и статистика
```

## 🔌 API Integration

Все API запросы идут через единый axios инстанс (`src/api/axiosConfig.js`):

### Автоматические фичи
- ✅ JWT токен добавляется в `Authorization: Bearer` заголовок
- ✅ Обработка 401 ошибок (перенаправление на логин)
- ✅ Обработка 403 ошибок (перенаправление на главную)
- ✅ Базовый URL из переменной `REACT_APP_API_URL`

### Примеры использования
```javascript
// Все API endpoints находятся в src/api/endpoints.js
import { productsAPI, authAPI, ordersAPI } from './api/endpoints';

// Использование
const products = await productsAPI.getAll();
const user = await authAPI.login(email, password);
const orders = await ordersAPI.getAll();
```

## 🎨 CSS архитектура

### Глобальные переменные (`src/styles/global.css`)
```css
--primary-color: #2aabee        /* Основной цвет */
--primary-dark: #0d96d8         /* Тёмный вариант */
--bg-light: #f9f9f9             /* Светлый фон */
--bg-white: #ffffff             /* Белый */
--text-primary: #333333         /* Основной текст */
--text-secondary: #666666       /* Вторичный текст */
--text-muted: #999999           /* Приглушённый текст */
--border-color: #e0e0e0         /* Границы */
```

### Структура стилей
- **global.css** - глобальные стили, сброс, переменные
- **компонент.css** - стили компонента
- **страница.css** - стили страницы
- Нет использования Tailwind или Material UI

## 🧪 Тестирование

Для тестирования используйте:
```bash
npm test
```

## 🔄 Жизненный цикл приложения

1. **Загрузка приложения**
   - React загружает App.js
   - AuthProvider проверяет наличие токена
   - Восстанавливается состояние пользователя

2. **Навигация**
   - Header показывает логотип, каталог, поиск, корзину
   - Если авторизован - показывает имя и выход
   - Если ADMIN - показывает кнопку админ-панели

3. **Покупка товара**
   - Пользователь ищет товар в каталоге
   - Добавляет в корзину
   - Оформляет заказ (требует авторизацию)

4. **Админ функции**
   - Только ADMIN может видеть кнопку админ-панели
   - Ограничение доступа на уровне маршрутов
   - API также проверяет права на backend

## 📝 Документация

В папке проекта находятся:
- **README.md** - основная документация
- **BACKEND_GUIDE.md** - рекомендации для backend
- **EXAMPLES.md** - примеры кода для разработчиков
- **ARCHITECTURE.md** - этот файл

## ✅ Checklist перед запуском

- [ ] Все зависимости установлены (`npm install`)
- [ ] Backend запущен на `http://localhost:8000`
- [ ] `.env` файл создан и настроен
- [ ] Backend имеет правильные CORS заголовки
- [ ] Все endpoints реализованы на backend
- [ ] Тестовые учётные данные есть или backend поддерживает регистрацию

## 🚀 Production build

```bash
npm run build
```

Создаст оптимизированную версию в папке `build/`

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера (F12)
2. Проверьте логи backend
3. Убедитесь, что все переменные окружения установлены
4. Проверьте CORS настройки на backend

---

**Проект готов к использованию! 🎉**
