from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query

from sqlalchemy.orm import Session

from typing import List

from pathlib import Path

import shutil

import os

import uuid



from app import crud, schemas

from app.dependencies import get_admin_user, get_db_session



router = APIRouter(tags=["products"])








@router.get("/", response_model=List[schemas.Product])

def list_products(db: Session = Depends(get_db_session)):

    """
    Получить список всех товаров
    """

    return crud.get_products(db)









@router.get("/search", response_model=List[schemas.Product])

def search_products(

    q: str | None = Query(None, min_length=1, max_length=100, description="Строка поиска"),

    query: str | None = Query(None, min_length=1, max_length=100, description="Альтернативное имя параметра поиска"),

    search: str | None = Query(None, min_length=1, max_length=100, description="Альтернативное имя параметра поиска"),

    db: Session = Depends(get_db_session),

):

    """
    Поиск товаров по строке (на стороне БД)
    Требует crud.search_products(db, q)
    """

    term = q or query or search

    if not term or not term.strip():

        return crud.get_products(db)

    return crud.search_products(db, term)








@router.get("/{product_id}", response_model=schemas.Product)

def get_product(product_id: int, db: Session = Depends(get_db_session)):

    """
    Получить товар по ID
    """

    product = crud.get_product(db, product_id)

    if not product:

        raise HTTPException(status_code=404, detail="Товар не найден")

    return product








@router.post("/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)

def create_product(

    product: schemas.ProductCreate,

    db: Session = Depends(get_db_session),

    admin=Depends(get_admin_user),

):

    """
    Создать новый товар (только админ)
    """

    return crud.create_product(db, product)








@router.post("/{product_id}/upload_image", response_model=schemas.Product)

def upload_product_image(

    product_id: int,

    file: UploadFile = File(...),

    db: Session = Depends(get_db_session),

    admin=Depends(get_admin_user),

):

    """
    Загружает фотографию для товара.
    Сохраняем файл в static/images и пишем в БД URL вида: /static/images/<filename>
    """

    product = crud.get_product(db, product_id)

    if not product:

        raise HTTPException(status_code=404, detail="Товар не найден")



    if not file or not file.filename:

        raise HTTPException(status_code=400, detail="Файл не выбран")






    BASE_DIR = Path(__file__).resolve().parent.parent.parent

    upload_dir = BASE_DIR / "static" / "images"

    upload_dir.mkdir(parents=True, exist_ok=True)




    _, ext = os.path.splitext(file.filename)

    ext = (ext or "").lower()




    if ext == "":

        ext = ".jpg"



    safe_name = f"{uuid.uuid4().hex}{ext}"

    file_path = upload_dir / safe_name




    try:

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(file.file, buffer)

    finally:


        try:

            file.file.close()

        except Exception:

            pass




    image_url = f"/static/images/{safe_name}"




    updated = crud.update_product_image(db, product_id, image_url)

    if not updated:

        raise HTTPException(status_code=404, detail="Товар не найден (при обновлении)")

    return updated








@router.put("/{product_id}", response_model=schemas.Product)

def update_product(

    product_id: int,

    product: schemas.ProductUpdate,

    db: Session = Depends(get_db_session),

    admin=Depends(get_admin_user),

):

    """
    Редактирование товара (только админ)
    """

    updated = crud.update_product(db, product_id, product)

    if not updated:

        raise HTTPException(status_code=404, detail="Товар не найден")

    return updated








@router.delete("/{product_id}", status_code=status.HTTP_200_OK)

def delete_product(

    product_id: int,

    db: Session = Depends(get_db_session),

    admin=Depends(get_admin_user),

):

    crud.delete_product(db, product_id)

    return {"detail": "Товар деактивирован", "product_id": product_id}

