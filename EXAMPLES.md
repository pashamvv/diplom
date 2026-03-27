# Примеры использования компонентов и hooks

Этот файл содержит примеры кода для использования основных компонентов и hooks приложения.

## 🔐 Использование useAuth hook

### Пример 1: Получение информации о пользователе

```javascript
import { useAuth } from './hooks/useAuth';

export const MyComponent = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <p>Пожалуйста, войдите</p>;
  }

  return (
    <div>
      <h1>Добро пожаловать, {user.name}!</h1>
      {isAdmin && <p>Вы администратор</p>}
    </div>
  );
};
```

### Пример 2: Вход пользователя

```javascript
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      alert('Ошибка входа');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
      />
      <button type="submit">Войти</button>
    </form>
  );
};
```

### Пример 3: Выход пользователя

```javascript
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return <button onClick={handleLogout}>Выход</button>;
};
```

## 🛒 Использование useCart hook

### Пример 1: Добавление товара в корзину

```javascript
import { useCart } from './hooks/useCart';

export const AddToCartButton = ({ product }) => {
  const { addToCart } = useCart();

  const handleClick = () => {
    addToCart(product, 1);
    alert(`${product.name} добавлен в корзину`);
  };

  return <button onClick={handleClick}>Добавить в корзину</button>;
};
```

### Пример 2: Отображение корзины

```javascript
import { useCart } from './hooks/useCart';

export const CartSummary = () => {
  const { cart, getTotalPrice, getTotalItems } = useCart();

  return (
    <div>
      <p>Товаров в корзине: {getTotalItems()}</p>
      <p>Сумма: {getTotalPrice().toFixed(0)}₽</p>
    </div>
  );
};
```

### Пример 3: Управление количеством товара

```javascript
import { useCart } from './hooks/useCart';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div>
      <h3>{item.name}</h3>
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
      />
      <button onClick={() => removeFromCart(item.id)}>Удалить</button>
    </div>
  );
};
```

## 🔒 Защита маршрутов с RequireAuth

### Пример 1: Защита маршрута для авторизованных пользователей

```javascript
import { RequireAuth } from './components/RequireAuth/RequireAuth';
import { ProfilePage } from './pages/Profile';

<Route
  path="/profile"
  element={
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  }
/>
```

### Пример 2: Защита маршрута только для админов

```javascript
import { RequireAuth } from './components/RequireAuth/RequireAuth';
import { AdminPanel } from './pages/Admin';

<Route
  path="/admin"
  element={
    <RequireAuth requiredRole="ADMIN">
      <AdminPanel />
    </RequireAuth>
  }
/>
```

### Пример 3: Условное отображение на основе роли

```javascript
import { useAuth } from './hooks/useAuth';

export const Navigation = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <nav>
      {isAuthenticated && (
        <>
          <a href="/profile">Профиль</a>
          {isAdmin && <a href="/admin">Админ-панель</a>}
        </>
      )}
    </nav>
  );
};
```

## 🛍️ Работа с API

### Пример 1: Получение списка товаров

```javascript
import { productsAPI } from './api/endpoints';
import { useState, useEffect } from 'react';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        setProducts(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price}₽</p>
        </div>
      ))}
    </div>
  );
};
```

### Пример 2: Поиск товаров

```javascript
import { productsAPI } from './api/endpoints';
import { useState } from 'react';

export const SearchProducts = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await productsAPI.search(query);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск..."
      />
      <button type="submit">Найти</button>
      {results.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </form>
  );
};
```

### Пример 3: Фильтрация товаров

```javascript
import { productsAPI } from './api/endpoints';
import { useState, useEffect } from 'react';

export const FilteredProducts = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  useEffect(() => {
    const loadProducts = async () => {
      const params = {
        category: category === 'all' ? undefined : category,
        min_price: priceRange[0],
        max_price: priceRange[1],
      };
      try {
        const response = await productsAPI.getAll(params);
        setProducts(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    loadProducts();
  }, [category, priceRange]);

  return (
    <div>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">Все категории</option>
        <option value="laptops">Ноутбуки</option>
        <option value="monitors">Мониторы</option>
      </select>
      {products.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
};
```

## 📝 Создание и обновление товаров (ADMIN)

### Пример 1: Форма создания товара

```javascript
import { productsAPI } from './api/endpoints';
import { useState } from 'react';

export const CreateProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.create(formData);
      alert('Товар создан!');
      setFormData({ name: '', price: '', category: '', description: '' });
    } catch (error) {
      alert('Ошибка при создании товара');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Название"
        required
      />
      <input
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        placeholder="Цена"
        required
      />
      <input
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Категория"
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Описание"
      />
      <button type="submit">Создать товар</button>
    </form>
  );
};
```

### Пример 2: Удаление товара

```javascript
import { productsAPI } from './api/endpoints';

export const DeleteProductButton = ({ productId }) => {
  const handleDelete = async () => {
    if (window.confirm('Вы уверены?')) {
      try {
        await productsAPI.delete(productId);
        alert('Товар удалён');
      } catch (error) {
        alert('Ошибка при удалении');
      }
    }
  };

  return <button onClick={handleDelete}>Удалить товар</button>;
};
```

## 📋 Управление заказами (ADMIN)

### Пример: Обновление статуса заказа

```javascript
import { ordersAPI } from './api/endpoints';

export const OrderStatusChanger = ({ orderId }) => {
  const handleStatusChange = async (newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      alert('Статус обновлён');
    } catch (error) {
      alert('Ошибка при обновлении');
    }
  };

  return (
    <select onChange={(e) => handleStatusChange(e.target.value)}>
      <option value="pending">В ожидании</option>
      <option value="processing">Обработка</option>
      <option value="shipped">Отправлен</option>
      <option value="delivered">Доставлен</option>
    </select>
  );
};
```

## 🎯 Практические советы

### 1. Обработка ошибок сетевого запроса

```javascript
try {
  const response = await productsAPI.getAll();
  setData(response.data);
} catch (error) {
  if (error.response?.status === 401) {
    // Токен истёк
    navigate('/login');
  } else if (error.response?.status === 403) {
    // Нет прав доступа
    alert('У вас нет прав');
  } else {
    alert('Ошибка при загрузке данных');
  }
}
```

### 2. Загрузка с состояниями

```javascript
export const DataLoader = ({ fetcher }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetcher();
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetcher]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
  return <div>{/* render data */}</div>;
};
```

### 3. Кэширование данных

```javascript
const [cache, setCache] = useState({});

const fetchWithCache = async (key, fetcher) => {
  if (cache[key]) return cache[key];
  const data = await fetcher();
  setCache((prev) => ({ ...prev, [key]: data }));
  return data;
};
```

---

**Успехов в разработке! 🚀**
