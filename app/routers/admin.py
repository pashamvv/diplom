from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from datetime import date, datetime

from typing import List



from app import crud, schemas

from app.dependencies import get_admin_user, get_superadmin_user, get_db_session

from app.utils import generate_sales_report_pdf



router = APIRouter(

    tags=["admin"],

    dependencies=[Depends(get_admin_user)]

)








@router.post("/categories", response_model=schemas.Category)

def create_category(

    category: schemas.CategoryCreate,

    db: Session = Depends(get_db_session),

):

    return crud.create_category(db, category)





@router.get("/categories", response_model=List[schemas.Category])

def list_categories(db: Session = Depends(get_db_session)):

    return crud.get_categories(db)










@router.post("/products", response_model=schemas.Product)

def create_product(

    product: schemas.ProductCreate,

    db: Session = Depends(get_db_session)

):

    return crud.create_product(db, product)





@router.put("/products/{product_id}", response_model=schemas.Product)

def update_product(

    product_id: int,

    product: schemas.ProductUpdate,

    db: Session = Depends(get_db_session)

):

    return crud.update_product(db, product_id, product)





@router.delete("/products/{product_id}", response_model=schemas.Product)

def delete_product(

    product_id: int,

    db: Session = Depends(get_db_session)

):

    return crud.delete_product(db, product_id)










@router.post("/discounts", response_model=schemas.Discount)

def create_discount(

    discount: schemas.DiscountCreate,

    db: Session = Depends(get_db_session)

):

    return crud.create_discount(db, discount)










@router.get("/orders", response_model=List[schemas.Order])

def list_orders(db: Session = Depends(get_db_session)):

    return crud.get_all_orders(db)





@router.put("/orders/{order_id}/status", response_model=schemas.Order)

def update_order_status(

    order_id: int,

    status: str,

    db: Session = Depends(get_db_session)

):

    return crud.update_order_status(db, order_id, status)










@router.post("/reports", response_model=schemas.Report)

def generate_sales_report(

    date_from: date,

    date_to: date,

    admin: schemas.User = Depends(get_admin_user),

    db: Session = Depends(get_db_session)

):


    pdf_path = generate_sales_report_pdf(db, date_from, date_to, admin)

    report_schema = schemas.ReportCreate(date_from=date_from, date_to=date_to)

    return crud.create_report(db, admin.id, report_schema, pdf_path)










superadmin_router = APIRouter(

    prefix="/superadmin",

    tags=["superadmin"],

    dependencies=[Depends(get_superadmin_user)]

)



@superadmin_router.put("/users/{user_id}/role", response_model=schemas.User)

def set_user_role(

    user_id: int,

    role_name: str,

    db: Session = Depends(get_db_session)

):

    return crud.set_user_role(db, user_id, role_name)

