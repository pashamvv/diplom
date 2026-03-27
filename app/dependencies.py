from fastapi import Depends, HTTPException, status

from sqlalchemy.orm import Session



from app.database import get_db

from app.auth import get_current_user

from app import models








def get_active_user(

    current_user: models.User = Depends(get_current_user),

) -> models.User:

    if not current_user.is_active:

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="Пользователь заблокирован",

        )

    return current_user








def get_admin_user(

    current_user: models.User = Depends(get_current_user),

) -> models.User:


    role_name = None

    try:

        role_name = current_user.role.name if current_user.role else None

    except Exception:

        role_name = None



    if role_name not in ("admin", "superadmin"):

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="Недостаточно прав администратора",

        )

    return current_user








def get_superadmin_user(

    current_user: models.User = Depends(get_current_user),

) -> models.User:

    role_name = None

    try:

        role_name = current_user.role.name if current_user.role else None

    except Exception:

        role_name = None



    if role_name != "superadmin":

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="Требуются права супер-администратора",

        )

    return current_user








def get_db_session():

    """
    Правильный вариант: просто пробрасываем yield из get_db(),
    без next(get_db()).
    """

    yield from get_db()
