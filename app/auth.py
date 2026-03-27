from datetime import datetime, timedelta

from typing import Optional



from fastapi import Depends, HTTPException, status

from fastapi.security import OAuth2PasswordBearer

from jose import JWTError, jwt

from passlib.context import CryptContext

from passlib.exc import UnknownHashError

import bcrypt

from sqlalchemy.orm import Session



from app import models, crud

from app.utils import get_password_hash

from app.database import get_db








SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_ME"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")








def verify_password(plain_password: str, hashed_password: str) -> bool:

    try:

        return pwd_context.verify(plain_password, hashed_password)

    except (UnknownHashError, ValueError, AttributeError):


        if plain_password == hashed_password:

            return True


        try:

            if isinstance(hashed_password, str) and hashed_password.startswith("$2"):

                return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

        except Exception:

            return False

        return False





def get_password_hash(password: str) -> str:

    return pwd_context.hash(password)








def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):

    to_encode = data.copy()



    expire = datetime.utcnow() + (

        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    )

    to_encode.update({"exp": expire})



    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt










def authenticate_user(db: Session, email: str, password: str):

    user = crud.get_user_by_email(db, email)

    if not user:

        return None

    ok = verify_password(password, user.password_hash)



    if ok and user.password_hash == password:

        try:


            user.password_hash = get_password_hash(password)

            db.commit()

            db.refresh(user)

        except Exception:

            pass



    if not ok:

        return None

    return user










def get_current_user(

    token: str = Depends(oauth2_scheme),

    db: Session = Depends(get_db)

):

    credentials_exception = HTTPException(

        status_code=status.HTTP_401_UNAUTHORIZED,

        detail="Не удалось проверить учетные данные",

        headers={"WWW-Authenticate": "Bearer"},

    )



    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id: int = payload.get("sub")

        if user_id is None:

            raise credentials_exception

    except JWTError:

        raise credentials_exception



    user = crud.get_user(db, user_id)

    if user is None:

        raise credentials_exception



    if not user.is_active:

        raise HTTPException(status_code=403, detail="Пользователь заблокирован")



    return user





def get_current_active_user(

    current_user: models.User = Depends(get_current_user)

):

    return current_user





def get_current_admin(

    current_user: models.User = Depends(get_current_user)

):

    if not current_user.is_admin:

        raise HTTPException(

            status_code=403,

            detail="Недостаточно прав доступа"

        )

    return current_user





def get_current_superadmin(

    current_user: models.User = Depends(get_current_user)

):

    if current_user.role.name != "superadmin":

        raise HTTPException(

            status_code=403,

            detail="Требуются права супер-администратора"

        )

    return current_user

