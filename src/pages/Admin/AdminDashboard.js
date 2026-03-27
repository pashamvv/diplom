import React, { useEffect, useState, useCallback } from "react";
import { ordersAPI, productsAPI, reportsAPI } from "../../api/endpoints";
import "./Admins.css";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    salesData: [],
    topProducts: [],
  });

  const [loading, setLoading] = useState(true);
  const extractArray = (res) => {
    if (res.status !== "fulfilled") return [];

    const d = res.value?.data;

    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.sales)) return d.sales;
    if (Array.isArray(d?.items)) return d.items;

    return [];
  };
  const loadStats = useCallback(async () => {
    setLoading(true);

    try {
      const [ordersRes, productsRes, salesRes, topRes] =
        await Promise.allSettled([
          ordersAPI.getAll(),
          productsAPI.getAll(),
          reportsAPI.getSales(),
          reportsAPI.getTopProducts(),
        ]);

      console.log("SALES RAW:", salesRes);
      console.log("TOP RAW:", topRes);

      const ordersData =
        ordersRes.status === "fulfilled" ? ordersRes.value.data || [] : [];

      const productsData =
        productsRes.status === "fulfilled" ? productsRes.value.data || [] : [];

      const salesData = extractArray(salesRes);
      const topProducts = extractArray(topRes);

      const lowStock = productsData.filter(
        (p) => Number(p.stock_quantity || 0) < 5
      ).length;

      const totalRevenue = ordersData.reduce(
        (sum, order) => sum + Number(order.total_price || 0),
        0
      );

      setStats({
        totalOrders: ordersData.length,
        totalProducts: productsData.length,
        totalRevenue,
        lowStockProducts: lowStock,
        salesData,
        topProducts,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadStats();
  }, [loadStats]);
  const getValue = (item) =>
    Number(
      item.sales ??
        item.value ??
        item.total ??
        item.amount ??
        item.count ??
        item.quantity ??
        0
    );
  const renderChart = (data) => {
    if (!data || !data.length) {
      return <p className="empty-state">Нет данных</p>;
    }

    const maxValue = Math.max(...data.map(getValue), 1);

    return (
      <div className="simple-chart">
        {data.slice(0, 7).map((item, idx) => {
          const val = getValue(item);

          const label =
            item.name ||
            item.product_name ||
            item.title ||
            item.date ||
            `#${idx + 1}`;

          return (
            <div key={idx} className="chart-row">
              <div className="chart-label">{label}</div>

              <div className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    width: `${(val / maxValue) * 100}%`,
                  }}
                />
              </div>

              <div className="chart-value">{val}</div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="loading">Загрузка статистики...</div>;

  const totalSalesSum = stats.salesData.reduce(
    (sum, s) => sum + Number(s.total ?? s.amount ?? 0),
    0
  );

  const avgSales = stats.salesData.length
    ? totalSalesSum / stats.salesData.length
    : 0;

  const maxSales = stats.salesData.length
    ? Math.max(
        ...stats.salesData.map((s) =>
          Number(s.total ?? s.amount ?? 0)
        )
      )
    : 0;

  const topProductsTotal = stats.topProducts.reduce(
    (sum, item) => sum + getValue(item),
    0
  );

  const leaderShare = topProductsTotal
    ? Math.round((getValue(stats.topProducts[0]) / topProductsTotal) * 100)
    : 0;

  const stockHealthyPercent = stats.totalProducts
    ? Math.max(
        0,
        Math.round(
          ((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100
        )
      )
    : 100;

  const salesBars = stats.salesData.slice(0, 6).map((item, index) => {
    const value = Number(item.total ?? item.amount ?? item.value ?? 0);
    const label = item.date || item.name || `Период ${index + 1}`;
    const width = maxSales > 0 ? Math.max((value / maxSales) * 100, 12) : 12;

    return {
      label,
      value,
      width,
    };
  });

  return (
    <div className="admin-dashboard">
      <h1>Панель управления</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-orders">
            <span className="stat-icon-chip">Заказы</span>
          </div>
          <div>
            <h3>Заказы</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-products">
            <span className="stat-icon-chip">Товары</span>
          </div>
          <div>
            <h3>Товары</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-revenue">
            <span className="stat-icon-chip">Выручка</span>
          </div>
          <div>
            <h3>Выручка</h3>
            <p className="stat-value">
              {Number(stats.totalRevenue || 0).toFixed(0)}₽
            </p>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon stat-icon-risk">
            <span className="stat-icon-chip">Риск</span>
          </div>
          <div>
            <h3>Мало товаров</h3>
            <p className="stat-value">{stats.lowStockProducts}</p>
          </div>
        </div>
      </div>
      <div className="reports-grid">
        <div className="reports-section">
          <h2>Топ товаров</h2>
          {renderChart(stats.topProducts)}
        </div>

        <div className="reports-section">
          <h2>Продажи</h2>
          {renderChart(stats.salesData)}

          <div className="sales-summary">
            <div>Всего: {totalSalesSum.toFixed(0)}₽</div>
            <div>Среднее: {avgSales.toFixed(0)}₽</div>
            <div>Макс: {Number(maxSales).toFixed(0)}₽</div>
          </div>
        </div>
      </div>

      <div className="analytics-showcase">
        <div className="analytics-panel analytics-panel-wide">
          <div className="analytics-panel-head">
            <div>
              <span className="analytics-kicker">Пульс продаж</span>
              <h2>Нижняя аналитика</h2>
            </div>
            <span className="analytics-chip">общий обзор</span>
          </div>

          {salesBars.length ? (
            <div className="analytics-bars">
              {salesBars.map((bar, index) => (
                <div key={`${bar.label}-${index}`} className="analytics-bar-row">
                  <div className="analytics-bar-meta">
                    <span>{bar.label}</span>
                    <strong>{bar.value.toFixed(0)}₽</strong>
                  </div>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{ width: `${bar.width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Недостаточно данных для нижнего графика продаж</p>
          )}
        </div>

        <div className="analytics-panel">
          <div className="analytics-panel-head">
            <div>
              <span className="analytics-kicker">Структура продаж</span>
              <h2>Доля лидера</h2>
            </div>
          </div>

          <div
            className="analytics-ring"
            style={{
              background: `conic-gradient(#38bdf8 0 ${leaderShare}%, rgba(148, 163, 184, 0.18) ${leaderShare}% 100%)`,
            }}
          >
            <div className="analytics-ring-inner">
              <strong>{leaderShare}%</strong>
              <span>от топ-продаж</span>
            </div>
          </div>

          <p className="analytics-note">
            Лидер сейчас даёт {leaderShare}% от объёма продаж в топе товаров.
          </p>
        </div>

        <div className="analytics-panel">
          <div className="analytics-panel-head">
            <div>
              <span className="analytics-kicker">Состояние склада</span>
              <h2>Склад</h2>
            </div>
          </div>

          <div
            className="analytics-ring analytics-ring-green"
            style={{
              background: `conic-gradient(#22c55e 0 ${stockHealthyPercent}%, rgba(148, 163, 184, 0.18) ${stockHealthyPercent}% 100%)`,
            }}
          >
            <div className="analytics-ring-inner">
              <strong>{stockHealthyPercent}%</strong>
              <span>в норме</span>
            </div>
          </div>

          <p className="analytics-note">
            {stats.totalProducts - stats.lowStockProducts} из {stats.totalProducts} товаров без риска
            низкого остатка.
          </p>
        </div>
      </div>
    </div>
  );
};
