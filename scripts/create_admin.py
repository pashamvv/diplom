import sys

sys.path.append('/Users/pavelmamaev/Desktop/back_diplom')

from app.database import SessionLocal

from app import crud, schemas

from app.utils import get_password_hash



EMAIL = 'admin@example.com'

PASSWORD = 'admin123'

FULL_NAME = 'Administrator'





def main():

    db = SessionLocal()

    try:

        role = crud.get_role_by_name(db, 'admin')

        if not role:

            print('Role "admin" not found — creating')

            role = crud.create_role(db, 'admin', 'Administrator')

            print('Created role id=', role.id)

        user = crud.get_user_by_email(db, EMAIL)

        if user:

            print('User exists:', user.email, '-> setting role to admin')

            crud.set_user_role(db, user.id, 'admin')

            print('Updated user role.')

        else:

            user_in = schemas.UserCreate(email=EMAIL, full_name=FULL_NAME, password=PASSWORD)

            user = crud.create_user(db, user_in, role_name='admin')

            print('Created admin user:', user.id, user.email)

    except Exception as e:

        print('Error:', e)

    finally:

        db.close()





if __name__ == '__main__':

    main()

