



from __future__ import annotations



from datetime import date, datetime, timedelta

from typing import Optional



from fastapi import HTTPException

from sqlalchemy import func, or_, desc

from sqlalchemy.orm import Session

from sqlalchemy.orm import joinedload



from app import models, schemas

from app.utils import get_password_hash





def _escape_like(value: str) -> str:

    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")










def get_role_by_name(db: Session, name: str):

    return db.query(models.Role).filter(models.Role.name == name).first()





def create_role(db: Session, name: str, description: str | None = None):

    role = models.Role(name=name, description=description)

    db.add(role)

    db.commit()

    db.refresh(role)

    return role










def get_user_by_email(db: Session, email: str):

    return db.query(models.User).filter(models.User.email == email).first()





def get_user(db: Session, user_id: int):

    return db.query(models.User).filter(models.User.id == user_id).first()





def create_user(db: Session, user: schemas.UserCreate, role_name: str = "customer"):

    if get_user_by_email(db, user.email):

        raise HTTPException(status_code=400, detail="Email already exists")



    role = get_role_by_name(db, role_name)

    if not role:



        fallback_role_name = "user" if role_name == "customer" else "customer"

        role = get_role_by_name(db, fallback_role_name)

    if not role:

        raise HTTPException(

            status_code=500,

            detail="Default registration role not found. Create role 'customer' or 'user'.",

        )



    db_user = models.User(

        email=user.email,

        full_name=user.full_name,

        password_hash=get_password_hash(user.password),

        role_id=role.id,

        is_active=True

    )



    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    _ = db_user.role

    return db_user





def update_last_login(db: Session, user_id: int):

    user = get_user(db, user_id)

    if not user:

        raise HTTPException(status_code=404, detail="User not found")



    user.last_login = datetime.utcnow()

    db.commit()

    db.refresh(user)

    return user





def set_user_role(db: Session, user_id: int, role_name: str):

    user = get_user(db, user_id)

    if not user:

        raise HTTPException(status_code=404, detail="User not found")



    role = get_role_by_name(db, role_name)

    if not role:

        raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found")



    user.role_id = role.id

    db.commit()

    db.refresh(user)

    return user










def get_categories(db: Session):

    return db.query(models.Category).filter(models.Category.is_active == True).all()





def create_category(db: Session, category: schemas.CategoryCreate):

    db_category = models.Category(

        name=category.name,

        parent_id=category.parent_id

    )

    db.add(db_category)

    db.commit()

    db.refresh(db_category)

    return db_category





def get_category(db: Session, category_id: int):

    return db.query(models.Category).filter(models.Category.id == category_id).first()





def deactivate_category(db: Session, category_id: int):

    category = get_category(db, category_id)

    if not category:

        raise HTTPException(status_code=404, detail="Category not found")

    category.is_active = False

    db.commit()

    db.refresh(category)

    return category





def update_category(db: Session, category_id: int, category: schemas.CategoryCreate):

    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()

    if not db_category:

        raise HTTPException(status_code=404, detail="Category not found")



    db_category.name = category.name

    db_category.parent_id = category.parent_id

    db.commit()

    db.refresh(db_category)

    return db_category










def get_products(db: Session):

    return (

        db.query(models.Product)

        .options(joinedload(models.Product.images))

        .filter(models.Product.is_active == True)

        .all()

    )



def get_product(db: Session, product_id: int):

    return (

        db.query(models.Product)

        .options(joinedload(models.Product.images))

        .filter(models.Product.id == product_id)

        .first()

    )





def search_products(db: Session, q: str):

    """
    Поиск товаров по строке.
    Ищет по name и description (если у тебя поля называются иначе — поправь тут).
    """

    q = (q or "").strip()

    if not q:

        return get_products(db)



    pattern = f"%{_escape_like(q)}%"

    return (

        db.query(models.Product)

        .options(joinedload(models.Product.images))

        .filter(

            models.Product.is_active == True,

            or_(

                models.Product.name.ilike(pattern, escape="\\"),

                models.Product.description.ilike(pattern, escape="\\"),

            )

        )

        .order_by(models.Product.name.asc())

        .all()

    )





def create_product(db: Session, product: schemas.ProductCreate):

    db_product = models.Product(

        name=product.name,

        description=product.description,

        price=product.price,

        stock_quantity=product.stock_quantity,

        category_id=product.category_id

    )

    db.add(db_product)

    db.commit()

    db.refresh(db_product)

    return db_product





def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):

    db_product = get_product(db, product_id)

    if not db_product:

        raise HTTPException(status_code=404, detail="Product not found")



    for field, value in product.dict(exclude_unset=True).items():

        setattr(db_product, field, value)



    db_product.updated_at = datetime.utcnow()

    db.commit()

    db.refresh(db_product)

    return db_product





def deactivate_product(db: Session, product_id: int):

    product = get_product(db, product_id)

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")



    product.is_active = False

    db.commit()

    db.refresh(product)

    return product





def delete_product(db: Session, product_id: int) -> bool:

    product = get_product(db, product_id)

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")



    product.is_active = False

    product.updated_at = datetime.utcnow()

    db.commit()

    return True










def add_product_image(db: Session, product_id: int, image_path: str, is_main: bool = False):

    product = get_product(db, product_id)

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")



    if is_main:

        db.query(models.ProductImage).filter(

            models.ProductImage.product_id == product_id,

            models.ProductImage.is_main == True

        ).update({"is_main": False})

        db.flush()



    image = models.ProductImage(

        product_id=product_id,

        image_path=image_path,

        is_main=is_main

    )

    db.add(image)

    db.commit()

    db.refresh(image)

    return image





def update_product_image(db: Session, product_id: int, image_path: str):

    """
    Устанавливает главное изображение товара:
    - снимает предыдущий main
    - добавляет новую запись ProductImage с is_main=True
    - возвращает product
    """

    product = get_product(db, product_id)

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")




    db.query(models.ProductImage).filter(

        models.ProductImage.product_id == product_id,

        models.ProductImage.is_main == True

    ).update({"is_main": False})




    image = models.ProductImage(

        product_id=product_id,

        image_path=image_path,

        is_main=True

    )

    db.add(image)



    db.commit()

    db.refresh(product)

    return product










def add_product_attribute(db: Session, product_id: int, name: str, value: str):

    product = get_product(db, product_id)

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")



    attr = models.ProductAttribute(

        product_id=product_id,

        name=name,

        value=value

    )

    db.add(attr)

    db.commit()

    db.refresh(attr)

    return attr










def create_discount(db: Session, discount: schemas.DiscountCreate):

    db_discount = models.Discount(

        product_id=discount.product_id,

        discount_percent=discount.discount_percent,

        start_date=discount.start_date,

        end_date=discount.end_date,

        is_active=True

    )

    db.add(db_discount)

    db.commit()

    db.refresh(db_discount)

    return db_discount





def update_discount(db: Session, discount_id: int, discount: schemas.DiscountCreate):

    db_discount = db.query(models.Discount).filter(models.Discount.id == discount_id).first()

    if not db_discount:

        raise HTTPException(status_code=404, detail="Discount not found")



    db_discount.product_id = discount.product_id

    db_discount.discount_percent = discount.discount_percent

    db_discount.start_date = discount.start_date

    db_discount.end_date = discount.end_date

    db.commit()

    db.refresh(db_discount)

    return db_discount





def get_active_discount(db: Session, product_id: int):

    today = date.today()

    return db.query(models.Discount).filter(

        models.Discount.product_id == product_id,

        models.Discount.is_active == True,

        models.Discount.start_date <= today,

        (models.Discount.end_date.is_(None)) | (models.Discount.end_date >= today)

    ).first()















def get_order(db: Session, order_id: int):

    return db.query(models.Order).filter(models.Order.id == order_id).first()





def create_order(db: Session, user_id: int, order: schemas.OrderCreate):

    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()



    if not cart or not cart.items:

        raise HTTPException(status_code=400, detail="Корзина пуста")



    total_price = 0

    items = []



    try:

        cart_items = list(cart.items)



        for item in cart_items:

            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()



            if not product:

                raise HTTPException(status_code=404, detail=f"Товар ID {item.product_id} не найден")



            if (product.stock_quantity or 0) < item.quantity:

                raise HTTPException(status_code=400, detail=f"Недостаточно товара: {product.name}")



            total_price += float(product.price or 0) * item.quantity



            items.append(

                models.OrderItem(

                    product_id=product.id,

                    quantity=item.quantity,

                    price_at_purchase=product.price,

                )

            )



            product.stock_quantity -= item.quantity



            db.add(

                models.StockMovement(

                    product_id=product.id,

                    quantity_change=-item.quantity,

                    reason="order",

                )

            )



        db_order = models.Order(

            user_id=user_id,

            status="created",

            total_price=total_price,

            items=items,

        )



        db.add(db_order)

        db.flush()



        for item in cart_items:

            db.delete(item)



        db.commit()

        db.refresh(db_order)



        return db_order



    except HTTPException:

        db.rollback()

        raise

    except Exception as e:

        db.rollback()

        print("CREATE ORDER ERROR:", repr(e))

        raise HTTPException(status_code=500, detail=f"Ошибка создания заказа: {str(e)}")





def get_user_orders(db: Session, user_id: int):

    return (

        db.query(models.Order)

        .filter(models.Order.user_id == user_id)

        .order_by(models.Order.created_at.desc())

        .all()

    )





def get_all_orders(db: Session):

    return (

        db.query(models.Order)

        .order_by(models.Order.created_at.desc())

        .all()

    )





def update_order_status(db: Session, order_id: int, new_status: str):

    order = get_order(db, order_id)



    if not order:

        raise HTTPException(status_code=404, detail="Заказ не найден")



    history = models.OrderStatusHistory(

        order_id=order.id,

        old_status=order.status,

        new_status=new_status,

    )



    order.status = new_status

    order.updated_at = datetime.utcnow()



    db.add(history)

    db.commit()

    db.refresh(order)



    return order










def create_payment(db: Session, payment: schemas.PaymentCreate):

    db_payment = models.Payment(

        order_id=payment.order_id,

        payment_method=payment.payment_method,

        payment_status="paid",

        amount=payment.amount,

        paid_at=datetime.utcnow()

    )

    db.add(db_payment)

    db.commit()

    db.refresh(db_payment)

    return db_payment










def create_receipt(db: Session, order_id: int, pdf_path: str):

    receipt = models.Receipt(order_id=order_id, pdf_path=pdf_path)

    db.add(receipt)

    db.commit()

    db.refresh(receipt)

    return receipt










def create_report(db: Session, admin_id: int, report: schemas.ReportCreate, pdf_path: str):

    db_report = models.Report(

        admin_id=admin_id,

        date_from=report.date_from,

        date_to=report.date_to,

        pdf_path=pdf_path

    )

    db.add(db_report)

    db.commit()

    db.refresh(db_report)

    return db_report





def get_reports(db: Session):

    return db.query(models.Report).all()





def get_sales_summary(db: Session, date_from: date, date_to: date):

    """
    Сводка продаж за период (сумма + кол-во заказов).
    created_at обычно datetime, поэтому переводим date -> datetime границы.
    """

    dt_from = datetime.combine(date_from, datetime.min.time())

    dt_to = datetime.combine(date_to, datetime.max.time())



    return db.query(

        func.sum(models.Order.total_price).label("total_profit"),

        func.count(models.Order.id).label("orders_count")

    ).filter(

        models.Order.created_at >= dt_from,

        models.Order.created_at <= dt_to

    ).first()










def get_sales_data(

    db: Session,

    date_from: Optional[date] = None,

    date_to: Optional[date] = None

):

    """
    Динамика продаж по дням: [{date: 'YYYY-MM-DD', total: 12345.0}, ...]
    Использует:
      - models.Order.created_at (datetime)
      - models.Order.total_price
    """

    if date_to is None:

        date_to = date.today()

    if date_from is None:

        date_from = date_to - timedelta(days=13)



    dt_from = datetime.combine(date_from, datetime.min.time())

    dt_to = datetime.combine(date_to, datetime.max.time())



    rows = (

        db.query(

            func.date(models.Order.created_at).label("day"),

            func.sum(models.Order.total_price).label("total"),

        )

        .filter(models.Order.created_at >= dt_from, models.Order.created_at <= dt_to)

        .group_by(func.date(models.Order.created_at))

        .order_by(func.date(models.Order.created_at))

        .all()

    )



    return [{"date": str(r.day), "total": float(r.total or 0)} for r in rows]





def get_top_products(

    db: Session,

    limit: int = 10,

    date_from: Optional[date] = None,

    date_to: Optional[date] = None

):

    """
    Топ товаров по количеству продаж: [{name: '...', sales: 10}, ...]
    Использует:
      - models.OrderItem.quantity
      - models.OrderItem.product_id
      - models.OrderItem.order_id
      - models.Product.name
      - models.Order.created_at
    """

    if limit < 1:

        limit = 1

    if limit > 50:

        limit = 50



    if date_to is None:

        date_to = date.today()

    if date_from is None:

        date_from = date_to - timedelta(days=30)



    dt_from = datetime.combine(date_from, datetime.min.time())

    dt_to = datetime.combine(date_to, datetime.max.time())



    rows = (

        db.query(

            models.Product.name.label("name"),

            func.sum(models.OrderItem.quantity).label("sales"),

        )

        .join(models.OrderItem, models.OrderItem.product_id == models.Product.id)

        .join(models.Order, models.Order.id == models.OrderItem.order_id)

        .filter(models.Order.created_at >= dt_from, models.Order.created_at <= dt_to)

        .group_by(models.Product.id)

        .order_by(desc(func.sum(models.OrderItem.quantity)))

        .limit(limit)

        .all()

    )



    return [{"name": r.name, "sales": int(r.sales or 0)} for r in rows]










def create_admin_log(

    db: Session,

    admin_id: int,

    action: str,

    entity: str,

    entity_id: int | None = None

):

    log = models.AdminLog(

        admin_id=admin_id,

        action=action,

        entity=entity,

        entity_id=entity_id

    )

    db.add(log)

    db.commit()

    db.refresh(log)

    return log



def pay_order(db: Session, order_id: int):

    order = get_order(db, order_id)



    if not order:

        raise HTTPException(404, "Order not found")



    if order.status == "paid":

        raise HTTPException(400, "Уже оплачен")



    order.status = "paid"



    payment = models.Payment(

        order_id=order.id,

        payment_method="card",

        payment_status="paid",

        amount=order.total_price,

        paid_at=datetime.utcnow()

    )



    db.add(payment)

    db.commit()



    return {"message": "Оплата прошла"}

