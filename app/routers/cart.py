from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from typing import List



from app.dependencies import get_active_user, get_db_session

from app import models, schemas



router = APIRouter(

    tags=["cart"]

)





@router.get("", response_model=schemas.Cart)

def get_my_cart(

    current_user: schemas.User = Depends(get_active_user),

    db: Session = Depends(get_db_session)

):

    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()

    if not cart:

        cart = models.Cart(user_id=current_user.id)

        db.add(cart)

        db.commit()

        db.refresh(cart)

    return cart





class AddCartItem(schemas.BaseModel):

    product_id: int

    quantity: int





@router.post("/items", response_model=schemas.Cart)

def add_item_to_cart(

    item: AddCartItem,

    current_user: schemas.User = Depends(get_active_user),

    db: Session = Depends(get_db_session)

):

    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()

    if not cart:

        cart = models.Cart(user_id=current_user.id)

        db.add(cart)

        db.commit()

        db.refresh(cart)



    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock_quantity < item.quantity:

        raise HTTPException(status_code=400, detail="Not enough stock")



    cart_item = db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id, models.CartItem.product_id == item.product_id).first()

    if cart_item:

        cart_item.quantity += item.quantity

    else:

        cart_item = models.CartItem(cart_id=cart.id, product_id=item.product_id, quantity=item.quantity)

        db.add(cart_item)



    db.commit()

    db.refresh(cart)

    return cart





@router.delete("/items/{item_id}", response_model=schemas.Cart)

def remove_item_from_cart(

    item_id: int,

    current_user: schemas.User = Depends(get_active_user),

    db: Session = Depends(get_db_session)

):

    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()

    if not cart:

        raise HTTPException(status_code=404, detail="Cart not found")

    cart_item = db.query(models.CartItem).filter(models.CartItem.id == item_id, models.CartItem.cart_id == cart.id).first()

    if not cart_item:

        raise HTTPException(status_code=404, detail="Item not found in cart")

    db.delete(cart_item)

    db.commit()

    db.refresh(cart)

    return cart

