from fastapi import APIRouter, Depends, status

from sqlalchemy.orm import Session

from typing import List



from app import crud, schemas

from app.dependencies import get_admin_user, get_db_session



router = APIRouter(tags=["categories"])










@router.get("/", response_model=List[schemas.Category])

def list_categories(db: Session = Depends(get_db_session)):

    """Список всех активных категорий"""

    return crud.get_categories(db)





@router.get("/{category_id}", response_model=schemas.Category)

def get_category(category_id: int, db: Session = Depends(get_db_session)):

    """Получить категорию по ID"""

    category = crud.get_category(db, category_id)

    if not category:

        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Category not found")

    return category










@router.post("/", response_model=schemas.Category)

def create_category(

    category: schemas.CategoryCreate,

    db: Session = Depends(get_db_session),

    admin=Depends(get_admin_user),

):

    """Создать новую категорию (только админ)"""

    return crud.create_category(db, category)





@router.put("/{category_id}", response_model=schemas.Category)

def update_category(

    category_id: int,

    category: schemas.CategoryCreate,

    db: Session = Depends(get_db_session),

    admin=Depends(get_admin_user),

):

    """Обновить категорию (только админ)"""

    return crud.update_category(db, category_id, category)





@router.delete("/{category_id}", status_code=status.HTTP_200_OK)

def delete_category(

    category_id: int,

    db: Session = Depends(get_db_session),

    admin=Depends(get_admin_user),

):

    """Мягкое удаление категории (is_active=False)"""

    crud.deactivate_category(db, category_id)

    return {"detail": "Категория деактивирована", "category_id": category_id}
