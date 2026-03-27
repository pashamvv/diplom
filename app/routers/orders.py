from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from typing import List



from app import crud, schemas

from app.dependencies import get_active_user, get_admin_user, get_db_session



router = APIRouter(tags=["orders"])





@router.post("", response_model=schemas.Order)

@router.post("/", response_model=schemas.Order)

def create_order(

    order: schemas.OrderCreate,

    current_user: schemas.User = Depends(get_active_user),

    db: Session = Depends(get_db_session)

):

    return crud.create_order(db, current_user.id, order)





@router.get("/me", response_model=List[schemas.Order])

def get_my_orders(

    current_user: schemas.User = Depends(get_active_user),

    db: Session = Depends(get_db_session)

):

    return crud.get_user_orders(db, current_user.id)





@router.get("", response_model=List[schemas.Order], dependencies=[Depends(get_admin_user)])

@router.get("/", response_model=List[schemas.Order], dependencies=[Depends(get_admin_user)])

def get_all_orders(db: Session = Depends(get_db_session)):

    return crud.get_all_orders(db)





@router.put("/{order_id}/status", response_model=schemas.Order, dependencies=[Depends(get_admin_user)])

def update_order_status(

    order_id: int,

    status: str,

    db: Session = Depends(get_db_session)

):

    return crud.update_order_status(db, order_id, status)





@router.post("/{order_id}/pay")

def pay_order(

    order_id: int,

    db: Session = Depends(get_db_session)

):

    return crud.pay_order(db, order_id)





@router.get("/{order_id}/receipt")

def generate_receipt(

    order_id: int,

    db: Session = Depends(get_db_session)

):

    return crud.generate_receipt(db, order_id)
