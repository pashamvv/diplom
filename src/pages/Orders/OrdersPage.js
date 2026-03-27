import React, { useEffect, useMemo, useState } from 'react';
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

const escapePdfText = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const transliterate = (value) => {
  const map = {
    А: 'A', а: 'a', Б: 'B', б: 'b', В: 'V', в: 'v', Г: 'G', г: 'g',
    Д: 'D', д: 'd', Е: 'E', е: 'e', Ё: 'E', ё: 'e', Ж: 'Zh', ж: 'zh',
    З: 'Z', з: 'z', И: 'I', и: 'i', Й: 'Y', й: 'y', К: 'K', к: 'k',
    Л: 'L', л: 'l', М: 'M', м: 'm', Н: 'N', н: 'n', О: 'O', о: 'o',
    П: 'P', п: 'p', Р: 'R', р: 'r', С: 'S', с: 's', Т: 'T', т: 't',
    У: 'U', у: 'u', Ф: 'F', ф: 'f', Х: 'Kh', х: 'kh', Ц: 'Ts', ц: 'ts',
    Ч: 'Ch', ч: 'ch', Ш: 'Sh', ш: 'sh', Щ: 'Sch', щ: 'sch', Ъ: '', ъ: '',
    Ы: 'Y', ы: 'y', Ь: '', ь: '', Э: 'E', э: 'e', Ю: 'Yu', ю: 'yu',
    Я: 'Ya', я: 'ya',
  };

  return String(value ?? '')
    .split('')
    .map((char) => map[char] ?? char)
    .join('');
};

const wrapPdfText = (text, maxLength = 58) => {
  const source = transliterate(text).trim();

  if (!source) return [''];

  const words = source.split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxLength) {
      current = next;
      return;
    }

    if (current) {
      lines.push(current);
      current = word;
      return;
    }

    lines.push(word.slice(0, maxLength));
    current = word.slice(maxLength);
  });

  if (current) {
    lines.push(current);
  }

  return lines;
};

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

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleDownloadReceipt = (order) => {
    const lines = [
      { text: 'NOCTA STORE', x: 50, y: 790, size: 22 },
      { text: 'Receipt / Tovarnyy chek', x: 50, y: 766, size: 14 },
      { text: `Order #${order.id}`, x: 50, y: 738, size: 18 },
      { text: `Date: ${formatDate(order.createdAt)}`, x: 50, y: 718, size: 12 },
      {
        text: `Status: ${transliterate(STATUS_LABELS[order.status] || order.status)}`,
        x: 50,
        y: 700,
        size: 12,
      },
      { text: 'Items:', x: 50, y: 672, size: 14 },
    ];

    let currentY = 648;

    order.items.forEach((item, index) => {
      const total = Number(item.quantity || 0) * Number(item.price || 0);
      const itemLines = wrapPdfText(
        `${index + 1}. ${item.name} | qty: ${item.quantity} | price: ${formatPrice(
          item.price
        )} | total: ${formatPrice(total)}`,
        72
      );

      itemLines.forEach((line) => {
        lines.push({ text: line, x: 56, y: currentY, size: 11 });
        currentY -= 16;
      });

      currentY -= 4;
    });

    currentY -= 10;
    lines.push({
      text: `Total quantity: ${order.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      )}`,
      x: 50,
      y: currentY,
      size: 12,
    });
    currentY -= 18;
    lines.push({ text: `Delivery: 0 RUB`, x: 50, y: currentY, size: 12 });
    currentY -= 20;
    lines.push({
      text: `TOTAL: ${formatPrice(order.totalPrice).replace('₽', ' RUB')}`,
      x: 50,
      y: currentY,
      size: 16,
    });
    currentY -= 38;
    lines.push({
      text: 'Store stamp: NOCTA STORE / OPLACHENO',
      x: 50,
      y: currentY,
      size: 12,
      color: '0.85 0.15 0.15',
    });

    const contentStream = [
      'BT',
      ...lines.flatMap((line) => [
        `/F1 ${line.size} Tf`,
        `${line.color || '0 0 0'} rg`,
        `1 0 0 1 ${line.x} ${line.y} Tm`,
        `(${escapePdfText(line.text)}) Tj`,
      ]),
      'ET',
    ].join('\n');

    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${contentStream.length} >> stream
${contentStream}
endstream
endobj`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object) => {
      offsets.push(pdf.length);
      pdf += `${object}\n`;
    });

    const xrefStart = pdf.length;
    pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;

    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });

    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefStart}
%%EOF`;

    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `receipt-order-${order.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
                  <button
                    type="button"
                    className="order-receipt-btn"
                    onClick={() => handleDownloadReceipt(order)}
                  >
                    Скачать PDF-чек
                  </button>
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
