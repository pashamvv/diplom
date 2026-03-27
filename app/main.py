from pathlib import Path



from fastapi import FastAPI, Request

from fastapi.exceptions import RequestValidationError

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import JSONResponse

from fastapi.staticfiles import StaticFiles



from app.database import engine

from app.models import Base

from app.routers import (

    users,

    products,

    orders,

    categories,

    discounts,

    payments,

    reports,

    admin,

    cart,

)



Base.metadata.create_all(bind=engine)



app = FastAPI(

    title="Информационная система розничной торговли ООО «Проспект»",

    description="Backend API для интернет-магазина компьютерной техники",

    version="1.0.0",

)






app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:3000",

        "http://127.0.0.1:3000",

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)






BASE_DIR = Path(__file__).resolve().parent.parent

STATIC_DIR = BASE_DIR / "static"

PDF_DIR = BASE_DIR / "pdfs"



STATIC_DIR.mkdir(parents=True, exist_ok=True)

PDF_DIR.mkdir(parents=True, exist_ok=True)






app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.mount("/reports", StaticFiles(directory=str(PDF_DIR)), name="reports")






@app.exception_handler(RequestValidationError)

async def validation_exception_handler(request: Request, exc: RequestValidationError):

    body = await request.body()



    print("\n=== 422 VALIDATION ERROR ===")

    print("URL:", request.url)

    print("METHOD:", request.method)

    print("BODY:", body.decode("utf-8", errors="ignore"))

    print("ERRORS:", exc.errors())

    print("=== END 422 ===\n")



    return JSONResponse(

        status_code=422,

        content={

            "detail": exc.errors(),

            "body": body.decode("utf-8", errors="ignore"),

        },

    )






app.include_router(users.router, prefix="/api/users", tags=["Users"])

app.include_router(products.router, prefix="/api/products", tags=["Products"])

app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])

app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])

app.include_router(discounts.router, prefix="/api/discounts", tags=["Discounts"])

app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])






@app.get("/")

def root():

    return {

        "message": "API работает",

        "project": "ИС розничной торговли ООО «Проспект»",

        "docs": "/docs",

    }
