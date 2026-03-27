from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session



from app import crud, schemas

from app.dependencies import get_active_user, get_db_session



router = APIRouter(

    tags=["payments"]

)








@router.post("/pay/{order_id}", response_model=schemas.Order)

def pay_order(

    order_id: int,

    current_user: schemas.User = Depends(get_active_user),

    db: Session = Depends(get_db_session)

):

    """
    Эмуляция оплаты заказа. Меняет статус заказа на 'paid'.
    """

    order = crud.get_order(db, order_id)

    if not order:

        raise HTTPException(status_code=404, detail="Заказ не найден")



    if order.user_id != current_user.id:

        raise HTTPException(status_code=403, detail="Нельзя оплатить чужой заказ")



    if order.status != "created":

        raise HTTPException(status_code=400, detail="Заказ уже оплачен или обработан")



    updated_order = crud.update_order_status(db, order_id, "paid")

    return updated_order

