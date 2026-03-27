from sqlalchemy import (

    Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey, Numeric,

    CheckConstraint

)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func



from app.database import Base








class Role(Base):

    __tablename__ = "roles"



    id = Column(Integer, primary_key=True)

    name = Column(String(50), unique=True, nullable=False)

    description = Column(Text)



    users = relationship("User", back_populates="role")








class User(Base):

    __tablename__ = "users"



    id = Column(Integer, primary_key=True)

    email = Column(String(100), unique=True, nullable=False, index=True)

    password_hash = Column(Text, nullable=False)

    full_name = Column(String(150))

    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())

    last_login = Column(DateTime)



    role = relationship("Role", back_populates="users")

    orders = relationship("Order", back_populates="user")

    reports = relationship("Report", back_populates="admin")

    logs = relationship("AdminLog", back_populates="admin")








class Category(Base):

    __tablename__ = "categories"



    id = Column(Integer, primary_key=True)

    name = Column(String(100), nullable=False)

    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())



    parent = relationship("Category", remote_side=[id])

    products = relationship("Product", back_populates="category")








class Product(Base):

    __tablename__ = "products"



    id = Column(Integer, primary_key=True)

    name = Column(String(150), nullable=False)

    description = Column(Text)

    price = Column(Numeric(10, 2), nullable=False)

    stock_quantity = Column(Integer, nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())

    updated_at = Column(DateTime)



    category = relationship("Category", back_populates="products")

    images = relationship("ProductImage", back_populates="product", cascade="all, delete")

    attributes = relationship("ProductAttribute", back_populates="product", cascade="all, delete")

    discounts = relationship("Discount", back_populates="product", cascade="all, delete")

    stock_movements = relationship("StockMovement", back_populates="product")








class ProductImage(Base):

    __tablename__ = "product_images"



    id = Column(Integer, primary_key=True)

    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    image_path = Column(Text, nullable=False)

    is_main = Column(Boolean, default=False)

    uploaded_at = Column(DateTime, server_default=func.now())



    product = relationship("Product", back_populates="images", passive_deletes=True)








class ProductAttribute(Base):

    __tablename__ = "product_attributes"



    id = Column(Integer, primary_key=True)

    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(100), nullable=False)

    value = Column(String(150), nullable=False)



    product = relationship("Product", back_populates="attributes", passive_deletes=True)








class Discount(Base):

    __tablename__ = "discounts"



    id = Column(Integer, primary_key=True)

    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    discount_percent = Column(Integer, nullable=False)

    start_date = Column(Date, nullable=False)

    end_date = Column(Date)

    is_active = Column(Boolean, default=True)



    product = relationship("Product", back_populates="discounts")

    __table_args__ = (

        CheckConstraint('discount_percent > 0 AND discount_percent <= 100', name='ck_discount_percent_range'),

    )








class Order(Base):

    __tablename__ = "orders"



    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    status = Column(String(30), nullable=False)

    total_price = Column(Numeric(10, 2), nullable=False)

    created_at = Column(DateTime, server_default=func.now())

    updated_at = Column(DateTime)



    user = relationship("User", back_populates="orders")

    items = relationship("OrderItem", back_populates="order", cascade="all, delete")

    receipt = relationship("Receipt", back_populates="order", uselist=False)

    status_history = relationship("OrderStatusHistory", back_populates="order")

    payment = relationship("Payment", back_populates="order", uselist=False)








class OrderItem(Base):

    __tablename__ = "order_items"



    id = Column(Integer, primary_key=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    quantity = Column(Integer, nullable=False)

    price_at_purchase = Column(Numeric(10, 2), nullable=False)



    order = relationship("Order", back_populates="items", passive_deletes=True)

    product = relationship("Product")








class OrderStatusHistory(Base):

    __tablename__ = "order_status_history"



    id = Column(Integer, primary_key=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)

    old_status = Column(String(30))

    new_status = Column(String(30))

    changed_at = Column(DateTime, server_default=func.now())



    order = relationship("Order", back_populates="status_history")








class Payment(Base):

    __tablename__ = "payments"



    id = Column(Integer, primary_key=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)

    payment_method = Column(String(30))

    payment_status = Column(String(30))

    amount = Column(Numeric(10, 2))

    paid_at = Column(DateTime)



    order = relationship("Order", back_populates="payment")








class StockMovement(Base):

    __tablename__ = "stock_movements"



    id = Column(Integer, primary_key=True)

    product_id = Column(Integer, ForeignKey("products.id", ondelete="NO ACTION"), nullable=False)

    quantity_change = Column(Integer, nullable=False)

    reason = Column(String(50))

    created_at = Column(DateTime, server_default=func.now())



    product = relationship("Product", back_populates="stock_movements")








class Receipt(Base):

    __tablename__ = "receipts"



    id = Column(Integer, primary_key=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)

    pdf_path = Column(Text, nullable=False)

    created_at = Column(DateTime, server_default=func.now())



    order = relationship("Order", back_populates="receipt")








class Report(Base):

    __tablename__ = "reports"



    id = Column(Integer, primary_key=True)

    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    date_from = Column(Date, nullable=False)

    date_to = Column(Date, nullable=False)

    pdf_path = Column(Text, nullable=False)

    created_at = Column(DateTime, server_default=func.now())



    admin = relationship("User", back_populates="reports")








class Cart(Base):

    __tablename__ = "carts"



    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    created_at = Column(DateTime, server_default=func.now())

    updated_at = Column(DateTime, server_default=func.now())



    user = relationship("User", backref="cart", passive_deletes=True)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete")





class CartItem(Base):

    __tablename__ = "cart_items"



    id = Column(Integer, primary_key=True)

    cart_id = Column(Integer, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)

    product_id = Column(Integer, ForeignKey("products.id", ondelete="NO ACTION"), nullable=False)

    quantity = Column(Integer, nullable=False)

    added_at = Column(DateTime, server_default=func.now())



    cart = relationship("Cart", back_populates="items", passive_deletes=True)

    product = relationship("Product")








class AdminLog(Base):

    __tablename__ = "admin_logs"



    id = Column(Integer, primary_key=True)

    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    action = Column(String(100))

    entity = Column(String(50))

    entity_id = Column(Integer)

    created_at = Column(DateTime, server_default=func.now())



    admin = relationship("User", back_populates="logs")

