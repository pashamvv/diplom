from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from typing import List

from datetime import date



from app import crud, schemas, models

from app.dependencies import get_admin_user, get_db_session



router = APIRouter(tags=["discounts"])








@router.get("/active", response_model=List[schemas.Discount])

def list_active_discounts(db: Session = Depends(get_db_session)):

    today = date.today()

    return db.query(models.Discount).filter(

        models.Discount.is_active == True,

        models.Discount.start_date <= today,

        models.Discount.end_date >= today

    ).all()








@router.get("/", response_model=List[schemas.Discount], dependencies=[Depends(get_admin_user)])

def list_all_discounts(db: Session = Depends(get_db_session)):

    return db.query(models.Discount).all()








@router.post("/", response_model=schemas.Discount, dependencies=[Depends(get_admin_user)])

def create_discount(

    discount: schemas.DiscountCreate,

    db: Session = Depends(get_db_session)

):

    return crud.create_discount(db, discount)





@router.put("/{discount_id}", response_model=schemas.Discount, dependencies=[Depends(get_admin_user)])

def update_discount(

    discount_id: int,

    discount: schemas.DiscountCreate,

    db: Session = Depends(get_db_session)

):

    return crud.update_discount(db, discount_id, discount)

