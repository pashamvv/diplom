from pydantic import BaseModel, EmailStr, ConfigDict, computed_field, Field

from typing import List, Optional

from datetime import datetime, date

from decimal import Decimal






class ORMBase(BaseModel):

    model_config = ConfigDict(from_attributes=True)


class APIBaseModel(BaseModel):

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")








class RoleBase(APIBaseModel):

    name: str = Field(..., min_length=1, max_length=50)

    description: Optional[str] = Field(None, max_length=1000)





class Role(RoleBase, ORMBase):

    id: int








class UserBase(APIBaseModel):

    email: EmailStr

    full_name: Optional[str] = Field(None, min_length=1, max_length=150)





class UserCreate(UserBase):

    password: str = Field(..., min_length=3, max_length=128)





class UserLogin(APIBaseModel):

    email: EmailStr

    password: str = Field(..., min_length=1, max_length=128)





class User(UserBase, ORMBase):

    id: int

    is_active: bool

    role: Role

    created_at: Optional[datetime] = None

    last_login: Optional[datetime] = None








class CategoryBase(APIBaseModel):

    name: str = Field(..., min_length=1, max_length=100)





class CategoryCreate(CategoryBase):

    parent_id: Optional[int] = None





class Category(CategoryBase, ORMBase):

    id: int

    parent_id: Optional[int] = None

    is_active: bool = True

    created_at: Optional[datetime] = None








class ProductBase(APIBaseModel):

    name: str = Field(..., min_length=1, max_length=150)

    description: Optional[str] = Field(None, max_length=5000)

    price: Decimal = Field(..., ge=0)

    stock_quantity: int = Field(..., ge=0)

    is_active: bool = True





class ProductCreate(ProductBase):

    category_id: int





class ProductUpdate(APIBaseModel):

    name: Optional[str] = Field(None, min_length=1, max_length=150)

    description: Optional[str] = Field(None, max_length=5000)

    price: Optional[Decimal] = Field(None, ge=0)

    stock_quantity: Optional[int] = Field(None, ge=0)

    is_active: Optional[bool] = None

    category_id: Optional[int] = None





class ProductImageBase(APIBaseModel):

    image_path: str = Field(..., min_length=1, max_length=2048)

    is_main: bool = False





class ProductImageCreate(ProductImageBase):

    product_id: int





class ProductImage(ProductImageBase, ORMBase):

    id: int

    product_id: int

    uploaded_at: Optional[datetime] = None





class ProductAttributeBase(APIBaseModel):

    name: str = Field(..., min_length=1, max_length=100)

    value: str = Field(..., min_length=1, max_length=150)





class ProductAttributeCreate(ProductAttributeBase):

    product_id: int





class ProductAttribute(ProductAttributeBase, ORMBase):

    id: int

    product_id: int





class Product(ProductBase, ORMBase):

    id: int

    category: Category

    images: List[ProductImage] = []

    attributes: List[ProductAttribute] = []

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None




    @computed_field

    @property

    def image(self) -> Optional[str]:

        for img in self.images:

            if img.is_main:

                return img.image_path

        return self.images[0].image_path if self.images else None








class DiscountBase(APIBaseModel):

    discount_percent: int = Field(..., ge=1, le=100)

    start_date: date

    end_date: Optional[date] = None





class DiscountCreate(DiscountBase):

    product_id: int





class Discount(DiscountBase, ORMBase):

    id: int

    product_id: int

    is_active: bool = True








class OrderItemBase(APIBaseModel):

    product_id: int

    quantity: int = Field(..., ge=1)





class OrderItemCreate(OrderItemBase):

    pass





class OrderItem(OrderItemBase, ORMBase):

    id: int

    order_id: int

    price_at_purchase: Decimal





class OrderCreate(APIBaseModel):

    items: List[OrderItemCreate]





class Order(ORMBase):

    id: int

    user_id: int

    status: str

    total_price: Decimal

    created_at: datetime

    updated_at: Optional[datetime] = None

    items: List[OrderItem] = []

    receipt: Optional["Receipt"] = None








class PaymentBase(APIBaseModel):

    order_id: int

    amount: Decimal = Field(..., ge=0)

    payment_method: str = Field(..., min_length=1, max_length=30)





class PaymentCreate(PaymentBase):

    pass





class Payment(PaymentBase, ORMBase):

    id: int

    payment_status: Optional[str] = None

    paid_at: Optional[datetime] = None








class ReportBase(APIBaseModel):

    date_from: date

    date_to: date





class ReportCreate(ReportBase):

    pass





class Report(ReportBase, ORMBase):

    id: int

    admin_id: int

    pdf_path: str

    created_at: datetime





class Receipt(ORMBase):

    id: int

    order_id: int

    pdf_path: str

    created_at: datetime








class CartItemBase(BaseModel):

    product_id: int

    quantity: int





class CartItemCreate(CartItemBase):

    cart_id: int





class CartItemUpdate(BaseModel):

    quantity: int





class CartItem(CartItemBase, ORMBase):

    id: int

    cart_id: int

    added_at: Optional[datetime] = None

    product: Optional[Product] = None





class CartCreate(BaseModel):

    user_id: int





class Cart(ORMBase):

    id: int

    user_id: int

    items: List[CartItem] = []

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

