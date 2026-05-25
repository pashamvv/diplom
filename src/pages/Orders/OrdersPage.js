import React, { useEffect, useMemo, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ordersAPI, productsAPI } from '../../api/endpoints';
import { FALLBACK_IMG, getImageSrc } from '../../utils/image';
import './OrdersPage.css';

const STATUS_LABELS = {
  pending: 'В ожидании',
  processing: 'Обработка',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  paid: 'Оплачен',
  created: 'Создан',
};

const normalizeItem = (item, index, productMap = {}) => {
  const product = item?.product || item?.product_data || {};
  const productId = Number(item?.product_id ?? product?.id ?? 0);
  const linkedProduct = productMap[productId] || {};

  return {
    id: item?.id ?? `${item?.product_id ?? 'item'}-${index}`,
    name:
      item?.name ??
      product?.name ??
      linkedProduct?.name ??
      `Товар ID ${productId || index + 1}`,
    quantity: Number(item?.quantity ?? 0),
    price: Number(item?.price ?? product?.price ?? linkedProduct?.price ?? 0),
    image:
      item?.image ??
      item?.image_url ??
      product?.image ??
      product?.image_url ??
      linkedProduct?.image ??
      linkedProduct?.image_url ??
      linkedProduct?.photo ??
      product?.photo ??
      '',
    productId,
  };
};

const normalizeOrder = (order, productMap = {}) => {
  const rawItems = order?.items || order?.order_items || order?.products || [];
  const items = Array.isArray(rawItems)
    ? rawItems.map((item, index) => normalizeItem(item, index, productMap))
    : [];

  return {
    id: order?.id,
    status: order?.status || 'pending',
    totalPrice: Number(order?.total_price ?? order?.totalPrice ?? 0),
    createdAt: order?.created_at ?? order?.createdAt ?? null,
    items,
  };
};

const getOrdersFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getProductsFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const formatPrice = (value) => `${Number(value || 0).toFixed(0)}₽`;

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (value) => {
  if (!value) return 'Дата неизвестна';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Дата неизвестна';
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCancelOrderErrorMessage = (error) => {
  const status = error?.response?.status;

  if ([403, 404, 405].includes(status)) {
    return 'На backend нет доступного маршрута для отмены заказа обычным пользователем.';
  }

  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    'Не удалось отменить заказ'
  );
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const [ordersResponse, productsResponse] = await Promise.all([
          ordersAPI.getMyOrders(),
          productsAPI.getAll(),
        ]);

        const productMap = getProductsFromResponse(productsResponse?.data).reduce(
          (acc, product) => {
            const id = Number(product?.id);

            if (id > 0) {
              acc[id] = product;
            }

            return acc;
          },
          {}
        );

        const normalized = getOrdersFromResponse(ordersResponse?.data).map((order) =>
          normalizeOrder(order, productMap)
        );
        setOrders(normalized);
      } catch (err) {
        console.error('Ошибка загрузки моих заказов:', err);
        setOrders([]);
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Не удалось загрузить ваши заказы'
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  }, [orders]);

  const canCancelOrder = (status) =>
    ['pending', 'created', 'processing', 'paid'].includes(String(status || '').toLowerCase());

  const handleCancelOrder = async (order) => {
    if (!canCancelOrder(order.status)) {
      return;
    }

    const confirmed = window.confirm(`Отменить заказ #${order.id}?`);

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(order.id);
      await ordersAPI.cancelMyOrder(order.id);

      setOrders((prevOrders) =>
        prevOrders.map((item) =>
          item.id === order.id ? { ...item, status: 'cancelled' } : item
        )
      );
    } catch (err) {
      console.error('Ошибка отмены заказа:', err);
      window.alert(getCancelOrderErrorMessage(err));
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleDownloadReceipt = async (order) => {
    const totalQuantity = order.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const itemsMarkup = order.items
      .map((item, index) => {
        const total = Number(item.quantity || 0) * Number(item.price || 0);

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${formatPrice(total)}</td>
          </tr>
        `;
      })
      .join('');

    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.width = '900px';
    container.style.padding = '32px';
    container.style.background = '#edf1f7';
    container.style.zIndex = '-1';

    container.innerHTML = `
      <div style="
        width: 820px;
        background: #ffffff;
        border-radius: 24px;
        padding: 42px 42px 56px;
        box-shadow: 0 28px 60px rgba(15, 23, 42, 0.12);
        position: relative;
        overflow: hidden;
        font-family: 'Segoe UI', 'SF Pro Text', Arial, sans-serif;
        color: #111827;
      ">
        <div style="position:absolute;inset:0;background:
          radial-gradient(380px 220px at 100% 0%, rgba(42, 171, 238, 0.08), transparent 70%),
          radial-gradient(260px 180px at 0% 100%, rgba(220, 38, 38, 0.06), transparent 72%);
          pointer-events:none;"></div>

        <div style="position:relative;z-index:1;">
          <h1 style="margin:0 0 10px;font-size:52px;line-height:0.94;letter-spacing:-0.05em;font-weight:900;color:#0f172a;">
            NOCTA STORE
          </h1>
          <p style="margin:0;color:#475569;font-size:18px;font-weight:600;">Товарный чек</p>

          <div style="margin-top:28px;display:grid;gap:10px;">
            <h2 style="margin:0;font-size:28px;color:#111827;">Заказ №${order.id}</h2>
            <p style="margin:0;font-size:16px;color:#475569;">Дата: ${escapeHtml(formatDate(order.createdAt))}</p>
            <p style="margin:0;font-size:16px;color:#475569;">Статус: ${escapeHtml(
              STATUS_LABELS[order.status] || order.status
            )}</p>
          </div>

          <div style="margin-top:34px;">
            <h3 style="margin:0 0 16px;font-size:22px;color:#111827;">Состав заказа</h3>
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:14px 12px;background:#f8fafc;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;">№</th>
                  <th style="text-align:left;padding:14px 12px;background:#f8fafc;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;">Товар</th>
                  <th style="text-align:left;padding:14px 12px;background:#f8fafc;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;">Кол-во</th>
                  <th style="text-align:left;padding:14px 12px;background:#f8fafc;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;">Цена</th>
                  <th style="text-align:left;padding:14px 12px;background:#f8fafc;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;">Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${itemsMarkup}
              </tbody>
            </table>
          </div>

          <div style="margin-top:28px;margin-left:auto;width:320px;padding:18px 20px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;">
            <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:10px;color:#334155;font-size:15px;">
              <span>Общее количество</span>
              <strong>${totalQuantity}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:10px;color:#334155;font-size:15px;">
              <span>Доставка</span>
              <strong>0₽</strong>
            </div>
            <div style="margin-top:16px;padding-top:14px;border-top:1px dashed #cbd5e1;display:flex;justify-content:space-between;gap:16px;font-size:26px;font-weight:900;color:#0f172a;">
              <span>Итого</span>
              <span>${formatPrice(order.totalPrice)}</span>
            </div>
          </div>

          <div style="margin-top:36px;display:flex;justify-content:flex-end;">
            <div style="
              width:180px;height:180px;border:5px solid rgba(220,38,38,0.78);border-radius:50%;
              color:rgba(220,38,38,0.9);display:flex;align-items:center;justify-content:center;
              text-align:center;transform:rotate(-16deg);position:relative;
              box-shadow:0 0 0 10px rgba(220,38,38,0.08);">
              <div style="position:absolute;inset:12px;border:2px solid rgba(220,38,38,0.6);border-radius:50%;"></div>
              <div style="position:relative;z-index:1;">
                <strong style="display:block;font-size:24px;letter-spacing:0.08em;">ОПЛАЧЕНО</strong>
                <span style="display:block;margin-top:8px;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">NOCTA STORE</span>
              </div>
            </div>
          </div>

          <div style="margin-top:22px;color:#64748b;font-size:14px;text-align:right;">
            Чек сформирован автоматически в интернет-магазине NOCTA STORE
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('td').forEach((cell) => {
      cell.style.textAlign = 'left';
      cell.style.padding = '14px 12px';
      cell.style.borderBottom = '1px solid #e5e7eb';
      cell.style.verticalAlign = 'top';
    });

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container.firstElementChild, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#edf1f7',
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(imageData, 'PNG', margin, position, usableWidth, imageHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight + margin;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', margin, position, usableWidth, imageHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`chek-zakaza-${order.id}.pdf`);
    } catch (error) {
      console.error('Ошибка генерации PDF-чека:', error);
      window.alert('Не удалось скачать PDF-чек. Попробуйте ещё раз.');
    } finally {
      container.remove();
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-state">Загрузка заказов...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-state orders-state-error">{error}</div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-empty">
            <h1>Мои заказы</h1>
            <p>У вас пока нет оформленных заказов</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <div>
            <h1>Мои заказы</h1>
            <p>История ваших покупок и текущие статусы заказов</p>
          </div>

          <div className="orders-summary">
            <span>{orders.length} заказ(ов)</span>
            <strong>На сумму {formatPrice(totalSpent)}</strong>
          </div>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <h2>Заказ #{order.id}</h2>
                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <div className="order-card-meta">
                  <span className={`order-status status-${order.status}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <strong>{formatPrice(order.totalPrice)}</strong>
                  <div className="order-card-actions">
                    {canCancelOrder(order.status) && (
                      <button
                        type="button"
                        className="order-cancel-btn"
                        onClick={() => handleCancelOrder(order)}
                        disabled={cancellingOrderId === order.id}
                      >
                        {cancellingOrderId === order.id ? 'Отмена...' : 'Отменить заказ'}
                      </button>
                    )}

                    <button
                      type="button"
                      className="order-receipt-btn"
                      onClick={() => handleDownloadReceipt(order)}
                    >
                      Скачать PDF-чек
                    </button>
                  </div>
                </div>
              </div>

              {order.items.length > 0 ? (
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img
                        src={getImageSrc(item.image)}
                        alt={item.name}
                        className="order-item-image"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />

                      <div className="order-item-info">
                        <h3>{item.name}</h3>
                        <p>Количество: {item.quantity}</p>
                      </div>

                      <div className="order-item-price">{formatPrice(item.price)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="order-items-empty">Состав заказа не был возвращён сервером</div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
