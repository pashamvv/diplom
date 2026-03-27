



from __future__ import annotations



from datetime import date

from typing import List, Optional



from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session



from app import crud, schemas

from app.dependencies import get_admin_user, get_db_session

from app.utils import generate_sales_report_pdf



router = APIRouter(

    tags=["reports"],

    dependencies=[Depends(get_admin_user)]

)





@router.post("/", response_model=schemas.Report)

def create_report(

    date_from: date,

    date_to: date,

    admin: schemas.User = Depends(get_admin_user),

    db: Session = Depends(get_db_session)

):

    if date_from > date_to:

        raise HTTPException(

            status_code=400,

            detail="date_from не может быть больше date_to"

        )



    try:

        pdf_path = generate_sales_report_pdf(db, date_from, date_to, admin)

        report_schema = schemas.ReportCreate(date_from=date_from, date_to=date_to)

        report = crud.create_report(db, admin.id, report_schema, pdf_path)

        return report



    except FileNotFoundError as e:

        raise HTTPException(status_code=500, detail=str(e))



    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Ошибка при создании отчёта: {str(e)}"

        )





@router.get("/", response_model=List[schemas.Report])

def list_reports(

    db: Session = Depends(get_db_session)

):

    return crud.get_reports(db)





@router.get("/sales")

def sales(

    date_from: Optional[date] = None,

    date_to: Optional[date] = None,

    db: Session = Depends(get_db_session)

):

    if date_from and date_to and date_from > date_to:

        raise HTTPException(

            status_code=400,

            detail="date_from не может быть больше date_to"

        )



    return crud.get_sales_data(db, date_from=date_from, date_to=date_to)





@router.get("/top-products")

def top_products(

    limit: int = 10,

    date_from: Optional[date] = None,

    date_to: Optional[date] = None,

    db: Session = Depends(get_db_session)

):

    if limit <= 0:

        raise HTTPException(

            status_code=400,

            detail="limit должен быть больше 0"

        )



    if date_from and date_to and date_from > date_to:

        raise HTTPException(

            status_code=400,

            detail="date_from не может быть больше date_to"

        )



    return crud.get_top_products(

        db,

        limit=limit,

        date_from=date_from,

        date_to=date_to

    )
