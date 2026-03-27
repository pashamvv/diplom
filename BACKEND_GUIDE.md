# FastAPI Backend конфигурация для фронтенда

Это рекомендуемая конфигурация FastAPI backend для работы с этим React приложением.

## ⚙️ Минимальная конфигурация FastAPI

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthCredential
from typing import Optional

app = FastAPI()

# CORS конфигурация
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Структуры данных
from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class User(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginResponse(BaseModel):
    token: str
    user: User

# JWT токены
from datetime import datetime, timedelta
import jwt

SECRET_KEY = "your-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Endpoints
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Проверка email/password в базе данных
    # user = get_user_from_db(request.email)
    # if not verify_password(request.password, user.password_hash):
    #     raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Пример ответа:
    token = create_access_token({"sub": "user@example.com", "role": "USER"})
    return LoginResponse(
        token=token,
        user=User(
            id=1,
            email="user@example.com",
            name="John Doe",
            role=UserRole.USER
        )
    )

@app.post("/api/auth/register", response_model=LoginResponse)
async def register(request: RegisterRequest):
    # Проверка email на существование
    # if user_exists(request.email):
    #     raise HTTPException(status_code=400, detail="Email already exists")
    
    # Создание пользователя в БД
    # create_user(request.email, request.password, request.name)
    
    token = create_access_token({"sub": request.email, "role": "USER"})
    return LoginResponse(
        token=token,
        user=User(
            id=1,
            email=request.email,
            name=request.name,
            role=UserRole.USER
        )
    )

@app.post("/api/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me", response_model=User)
async def get_current_user(authorization: Optional[str] = None):
    # Извлечь token из заголовка Authorization: Bearer <token>
    # Проверить token с помощью jwt.decode()
    # Получить данные пользователя из БД
    
    return User(
        id=1,
        email="user@example.com",
        name="John Doe",
        role=UserRole.USER
    )

# Товары
class Product(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str
    image: Optional[str] = None
    stock: int
    rating: Optional[float] = None
    discount: Optional[int] = None

@app.get("/api/products", response_model=list)
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: float = 0,
    max_price: float = 999999
):
    # Получить товары из БД с фильтрацией
    return [
        Product(
            id=1,
            name="Laptop Dell XPS 13",
            description="Premium ultrabook",
            price=1299.99,
            category="laptops",
            image="https://example.com/laptop.jpg",
            stock=5,
            rating=4.5,
            discount=10
        ),
        Product(
            id=2,
            name="Monitor LG 27",
            description="4K monitor",
            price=599.99,
            category="monitors",
            image="https://example.com/monitor.jpg",
            stock=10
        )
    ]

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    # Получить товар из БД
    return Product(
        id=product_id,
        name="Laptop Dell XPS 13",
        description="Premium ultrabook",
        price=1299.99,
        category="laptops",
        image="https://example.com/laptop.jpg",
        stock=5,
        rating=4.5
    )

@app.post("/api/products")
async def create_product(product: Product):
    # Проверить роль ADMIN
    # Создать товар в БД
    return {"id": 1, "message": "Product created"}

@app.put("/api/products/{product_id}")
async def update_product(product_id: int, product: Product):
    # Проверить роль ADMIN
    # Обновить товар в БД
    return {"message": "Product updated"}

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int):
    # Проверить роль ADMIN
    # Удалить товар из БД
    return {"message": "Product deleted"}

# Категории
class Category(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

@app.get("/api/categories", response_model=list)
async def get_categories():
    return [
        Category(id=1, name="Laptops", description="Ноутбуки"),
        Category(id=2, name="Monitors", description="Мониторы"),
        Category(id=3, name="Keyboards", description="Клавиатуры"),
    ]

# Заказы
class Order(BaseModel):
    id: int
    user_id: int
    items: list
    total: float
    status: str
    created_at: str

@app.get("/api/orders", response_model=list)
async def get_user_orders():
    # Получить заказы текущего пользователя
    return []

@app.post("/api/orders")
async def create_order(order_data: dict):
    # Создать заказ в БД
    return {"id": 1, "message": "Order created"}

@app.patch("/api/orders/{order_id}")
async def update_order_status(order_id: int, status: dict):
    # Проверить роль ADMIN
    # Обновить статус заказа
    return {"message": "Order status updated"}

# Скидки
class Discount(BaseModel):
    id: int
    name: str
    code: str
    discount_percent: int
    expiry_date: str

@app.get("/api/discounts", response_model=list)
async def get_discounts():
    return []

@app.post("/api/discounts")
async def create_discount(discount: Discount):
    # Проверить роль ADMIN
    return {"id": 1, "message": "Discount created"}

@app.delete("/api/discounts/{discount_id}")
async def delete_discount(discount_id: int):
    # Проверить роль ADMIN
    return {"message": "Discount deleted"}

# Отчёты
@app.get("/api/reports/sales")
async def get_sales_report():
    # Проверить роль ADMIN
    return []

@app.get("/api/reports/top-products")
async def get_top_products():
    # Проверить роль ADMIN
    return []

@app.get("/api/reports/users")
async def get_user_stats():
    # Проверить роль ADMIN
    return {
        "total_users": 150,
        "active_users": 45,
        "new_users_month": 12
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🔐 Аутентификация и JWT

### Проверка JWT токена в backend

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthCredentialBearer

security = HTTPBearer()

def get_current_user(credentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

# Использование:
@app.get("/api/protected")
async def protected_route(current_user = Depends(get_current_user)):
    return {"user": current_user}
```

## 📋 Обязательные ответы API

### Ответ при логине (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Ошибка при логине (401)
```json
{
  "message": "Invalid credentials"
}
```

### Ошибка доступа (403)
```json
{
  "message": "Access denied"
}
```

## 🚀 Запуск FastAPI

```bash
# Установить зависимости
pip install fastapi uvicorn python-jose[cryptography] pydantic

# Запустить сервер
python main.py

# Или с uvicorn напрямую
uvicorn main:app --reload --port 8000
```

API будет доступна по адресу: `http://localhost:8000`
Документация (Swagger): `http://localhost:8000/docs`

## ✅ Чеклист для backend разработчика

- [ ] Реализовать все endpoints из списка выше
- [ ] Настроить CORS для `http://localhost:3000`
- [ ] Реализовать JWT аутентификацию
- [ ] Добавить проверки прав доступа (USER/ADMIN)
- [ ] Создать модели базы данных
- [ ] Реализовать валидацию данных
- [ ] Добавить обработку ошибок
- [ ] Протестировать все endpoints
- [ ] Документировать API

---

**Успехов в разработке backend! 🚀**
