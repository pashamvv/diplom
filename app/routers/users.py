from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from typing import List

from fastapi.responses import FileResponse

import os



from app import crud, schemas

from app.dependencies import get_active_user, get_db_session

from app.auth import create_access_token, authenticate_user



router = APIRouter(

    tags=["users"]

)








@router.post("/register", response_model=schemas.User)

def register_user(user: schemas.UserCreate, db: Session = Depends(get_db_session)):

    db_user = crud.get_user_by_email(db, user.email)

    if db_user:

        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    return crud.create_user(db, user)










class LoginRequest(schemas.BaseModel):

    email: str

    password: str





@router.post("/login")

def login_user(data: LoginRequest, db: Session = Depends(get_db_session)):

    user = authenticate_user(db, data.email, data.password)

    if not user:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Неверный email или пароль"

        )


    token_data = {"sub": str(user.id), "role": user.role.name}

    access_token = create_access_token(token_data)

    return {"access_token": access_token, "token_type": "bearer", "role": user.role.name}










@router.get("/me", response_model=schemas.User)

def get_my_profile(current_user: schemas.User = Depends(get_active_user)):

    return current_user










@router.get("/orders", response_model=List[schemas.Order])

def get_my_orders(

    current_user: schemas.User = Depends(get_active_user),

    db: Session = Depends(get_db_session)

):

    return crud.get_user_orders(db, current_user.id)










@router.get("/orders/{order_id}/download")

def download_order_pdf(

    order_id: int,

    current_user: schemas.User = Depends(get_active_user),

    db: Session = Depends(get_db_session)

):

    order = crud.get_order(db, order_id)

    if not order:

        raise HTTPException(status_code=404, detail="Заказ не найден")



    if order.user_id != current_user.id:

        raise HTTPException(status_code=403, detail="Нельзя скачать чужой чек")



    if not order.receipt or not os.path.exists(order.receipt.pdf_path):

        raise HTTPException(status_code=404, detail="PDF чек не найден")



    return FileResponse(order.receipt.pdf_path, filename=f"order_{order.id}.pdf")

