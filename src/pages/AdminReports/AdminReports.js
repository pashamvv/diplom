import React, { useEffect, useMemo, useState, useCallback } from "react";
import { reportsAPI } from "../../api/endpoints";
import "../Admin.css";

const BACKEND_ORIGIN = "http://127.0.0.1:8000";

const safeRequest = async (promiseFactory, fallback) => {
  try {
    const res = await promiseFactory();
    return res?.data ?? fallback;
  } catch (e) {
    console.error("Request error:", e?.response?.status, e?.response?.data || e.message);
    return fallback;
  }
};

export const AdminReports = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayISO = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(todayISO);
  const [dateTo, setDateTo] = useState(todayISO);

  const loadAll = useCallback(async () => {
    setLoading(true);

    try {
      const [topData, listData] = await Promise.all([
        safeRequest(() => reportsAPI.getTopProducts(), []),
        safeRequest(() => reportsAPI.getAll(), []),
      ]);

      setTopProducts(Array.isArray(topData) ? topData : []);
      setReports(Array.isArray(listData) ? listData : []);
    } catch (e) {
      console.error("Error loading reports:", e);
      setTopProducts([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createPdfReport = async () => {
    if (!dateFrom || !dateTo) {
      alert("Выберите период");
      return;
    }

    if (dateFrom > dateTo) {
      alert("date_from не может быть больше date_to");
      return;
    }

    try {
      await reportsAPI.create({
        date_from: dateFrom,
        date_to: dateTo,
      });

      await loadAll();
      alert("PDF отчёт сформирован");
    } catch (e) {
      console.error("PDF create error:", e?.response?.status, e?.response?.data);
      alert(
        e?.response?.data?.detail || "Ошибка при генерации PDF отчёта"
      );
    }
  };

  const normalizePdfUrl = (pdfPath) => {
    if (!pdfPath) return null;
    if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) return pdfPath;
    if (pdfPath.startsWith("/")) return `${BACKEND_ORIGIN}${pdfPath}`;
    return `${BACKEND_ORIGIN}/${pdfPath}`;
  };

  const renderChart = (data, maxValue = 100) => (
    <div className="simple-chart">
      {data.slice(0, 10).map((item, idx) => {
        const value = Number(item.sales || 0);
        const width = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

        return (
          <div key={idx} className="chart-row">
            <div className="chart-label">{item.name || `Товар ${idx + 1}`}</div>
            <div className="chart-bar-container">
              <div className="chart-bar" style={{ width: `${width}%` }} />
            </div>
            <div className="chart-value">{value}</div>
          </div>
        );
      })}
    </div>
  );

  const maxSold = useMemo(() => {
    return Math.max(...topProducts.map((p) => Number(p.sales || 0)), 0) || 10;
  }, [topProducts]);

  if (loading) return <div className="loading">Загрузка отчётов...</div>;

  return (
    <div className="admin-reports">
      <div className="admin-header">
        <h1>Отчёты и аналитика</h1>
      </div>

      <div className="reports-section">
        <h2>PDF отчёт по периоду</h2>

        <div className="admin-filters" style={{ gap: 12 }}>
          <div className="filter-box">
            <label style={{ fontSize: 12, color: "#777" }}>Дата с</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <label style={{ fontSize: 12, color: "#777" }}>Дата по</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="search-input"
            />
          </div>

          <button className="btn-primary" onClick={createPdfReport}>
            Сформировать PDF
          </button>

          <button className="btn-secondary" onClick={loadAll}>
            Обновить
          </button>
        </div>

        <div className="admin-table" style={{ marginTop: 12 }}>
          {reports.length === 0 ? (
            <div className="empty-state">
              <p>PDF отчётов пока нет</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th style={{ width: 120 }}>Admin ID</th>
                  <th style={{ width: 140 }}>С</th>
                  <th style={{ width: 140 }}>По</th>
                  <th>Файл</th>
                  <th style={{ width: 160 }}>Создан</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const url = normalizePdfUrl(r.pdf_path);
                  return (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{r.admin_id}</td>
                      <td>{r.date_from}</td>
                      <td>{r.date_to}</td>
                      <td>
                        {url ? (
                          <a href={url} target="_blank" rel="noreferrer">
                            Открыть PDF
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString("ru-RU")
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="reports-section">
        <h2>Топ товаров по количеству продаж</h2>
        {topProducts.length > 0 ? (
          renderChart(topProducts, maxSold)
        ) : (
          <p className="empty-state">Нет данных</p>
        )}
      </div>

      <div className="reports-section">
        <h2>Топ товаров — таблица</h2>
        {topProducts.length > 0 ? (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th style={{ width: 160 }}>Продано, шт.</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.slice(0, 10).map((p, idx) => (
                  <tr key={idx}>
                    <td className="product-name">{p.name || "—"}</td>
                    <td className="quantity">{Number(p.sales || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">Нет данных о продажах</p>
        )}
      </div>
    </div>
  );
};