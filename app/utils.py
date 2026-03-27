import os

from datetime import datetime, time, date

from decimal import Decimal

from typing import Optional



from fpdf import FPDF

from passlib.context import CryptContext

from sqlalchemy.orm import Session, joinedload



from app import models










pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")





def verify_password(plain_password: str, hashed_password: str) -> bool:

    return pwd_context.verify(plain_password, hashed_password)





def get_password_hash(password: str) -> str:

    import bcrypt



    pw_bytes = password.encode() if isinstance(password, str) else password

    if len(pw_bytes) > 72:

        pw_bytes = pw_bytes[:72]



    try:

        return pwd_context.hash(password)

    except Exception:

        return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode()










def _ensure_dir(path: str) -> None:

    if not os.path.exists(path):

        os.makedirs(path)





def _get_fonts_dir() -> str:

    base_dir = os.path.dirname(os.path.abspath(__file__))

    return os.path.join(base_dir, "fonts")





def _create_pdf() -> FPDF:

    fonts_dir = _get_fonts_dir()

    regular = os.path.join(fonts_dir, "DejaVuSans.ttf")

    bold = os.path.join(fonts_dir, "DejaVuSans-Bold.ttf")



    if not os.path.exists(regular) or not os.path.exists(bold):

        raise FileNotFoundError(

            "Не найдены шрифты для кириллицы.\n"

            "Положи файлы:\n"

            f" - {regular}\n"

            f" - {bold}\n"

            "И перезапусти сервер."

        )



    pdf = FPDF()

    pdf.add_page()



    pdf.add_font("DejaVu", "", regular, uni=True)

    pdf.add_font("DejaVu", "B", bold, uni=True)

    pdf.set_font("DejaVu", size=12)



    return pdf





def _safe_text(value: Optional[str]) -> str:

    return "" if value is None else str(value)










def generate_order_pdf(order: models.Order, output_dir: str = "pdfs") -> str:

    _ensure_dir(output_dir)



    filename = f"order_{order.id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"

    filepath = os.path.join(output_dir, filename)



    pdf = _create_pdf()



    pdf.set_font("DejaVu", "B", 16)

    pdf.cell(0, 10, f"Электронный чек заказа #{order.id}", ln=True, align="C")

    pdf.ln(8)



    pdf.set_font("DejaVu", "", 12)

    pdf.cell(

        0,

        8,

        f"Пользователь: {_safe_text(getattr(order.user, 'full_name', None) or getattr(order.user, 'email', ''))}",

        ln=True,

    )

    pdf.cell(0, 8, f"Дата заказа: {order.created_at.strftime('%Y-%m-%d %H:%M')}", ln=True)

    pdf.cell(0, 8, f"Статус: {_safe_text(order.status)}", ln=True)

    pdf.ln(5)



    col_name = 80

    col_qty = 25

    col_price = 35

    col_sum = 35



    pdf.set_font("DejaVu", "B", 12)

    pdf.cell(col_name, 8, "Товар", 1)

    pdf.cell(col_qty, 8, "Кол-во", 1, align="C")

    pdf.cell(col_price, 8, "Цена", 1, align="C")

    pdf.cell(col_sum, 8, "Сумма", 1, align="C")

    pdf.ln()



    pdf.set_font("DejaVu", "", 12)

    total = Decimal("0.00")



    for item in order.items:

        price = Decimal(str(item.price_at_purchase or 0))

        qty = int(item.quantity or 0)

        line_total = price * qty

        total += line_total



        product_name = _safe_text(getattr(item.product, "name", ""))

        if len(product_name) > 45:

            product_name = product_name[:42] + "..."



        pdf.cell(col_name, 8, product_name, 1)

        pdf.cell(col_qty, 8, str(qty), 1, align="C")

        pdf.cell(col_price, 8, f"{price:.2f}", 1, align="R")

        pdf.cell(col_sum, 8, f"{line_total:.2f}", 1, align="R")

        pdf.ln()



    pdf.ln(4)

    pdf.set_font("DejaVu", "B", 12)

    pdf.cell(0, 8, f"Итого: {total:.2f}", ln=True, align="R")



    pdf.output(filepath)

    return filepath










def generate_sales_report_pdf(

    db: Session,

    date_from: date,

    date_to: date,

    admin: models.User,

    output_dir: str = "pdfs"

) -> str:

    _ensure_dir(output_dir)



    filename = f"sales_report_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"

    filepath = os.path.join(output_dir, filename)



    dt_from = datetime.combine(date_from, time.min)

    dt_to = datetime.combine(date_to, time.max)



    orders = (

        db.query(models.Order)

        .options(joinedload(models.Order.user))

        .filter(models.Order.created_at >= dt_from, models.Order.created_at <= dt_to)

        .order_by(models.Order.created_at.asc())

        .all()

    )



    total_profit = sum((Decimal(str(o.total_price or 0)) for o in orders), Decimal("0.00"))

    total_orders = len(orders)



    pdf = _create_pdf()



    pdf.set_font("DejaVu", "B", 16)

    pdf.cell(0, 10, "Отчет о продажах", ln=True, align="C")



    pdf.set_font("DejaVu", "", 12)

    pdf.cell(0, 8, f"Составил: {_safe_text(admin.full_name or admin.email)}", ln=True)

    pdf.cell(

        0,

        8,

        f"Период: {date_from.strftime('%Y-%m-%d')} - {date_to.strftime('%Y-%m-%d')}",

        ln=True,

    )

    pdf.ln(5)



    col_id = 25

    col_user = 85

    col_sum = 35

    col_date = 45



    pdf.set_font("DejaVu", "B", 12)

    pdf.cell(col_id, 8, "ID", 1, align="C")

    pdf.cell(col_user, 8, "Пользователь", 1, align="C")

    pdf.cell(col_sum, 8, "Сумма", 1, align="C")

    pdf.cell(col_date, 8, "Дата", 1, align="C")

    pdf.ln()



    pdf.set_font("DejaVu", "", 12)



    if not orders:

        pdf.cell(0, 8, "За выбранный период заказов не найдено", ln=True)

    else:

        for order in orders:

            user_name = _safe_text(getattr(order.user, "full_name", None) or getattr(order.user, "email", ""))

            if len(user_name) > 45:

                user_name = user_name[:42] + "..."



            total_price = Decimal(str(order.total_price or 0))



            pdf.cell(col_id, 8, str(order.id), 1, align="C")

            pdf.cell(col_user, 8, user_name, 1)

            pdf.cell(col_sum, 8, f"{total_price:.2f}", 1, align="R")

            pdf.cell(col_date, 8, order.created_at.strftime('%Y-%m-%d'), 1, align="C")

            pdf.ln()



    pdf.ln(5)

    pdf.set_font("DejaVu", "B", 12)

    pdf.cell(0, 8, f"Всего заказов: {total_orders}", ln=True)

    pdf.cell(0, 8, f"Общий доход: {total_profit:.2f}", ln=True)



    pdf.output(filepath)

    return f"/reports/{filename}"










def calculate_discounted_price(price: Decimal, discount_percent: int) -> Decimal:

    return price * (Decimal("1.0") - (Decimal(discount_percent) / Decimal("100.0")))





def format_datetime(dt: datetime) -> str:

    return dt.strftime("%d-%m-%Y %H:%M")
