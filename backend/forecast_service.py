# """Forecasting service using Linear Regression (scikit-learn) for IT Budget Buddy."""
# from __future__ import annotations
# import numpy as np
# from sklearn.linear_model import LinearRegression


# def train_monthly_model(monthly_totals):
#     """
#     Train linear regression on monthly totals.
#     monthly_totals: list of total spending per month in chronological order.
#     Returns (model, list of values used for training).
#     """
#     if not monthly_totals or len(monthly_totals) < 2:
#         return None, monthly_totals or []
#     X = np.array(list(range(len(monthly_totals)))).reshape(-1, 1)
#     y = np.array(monthly_totals, dtype=float)
#     model = LinearRegression()
#     model.fit(X, y)
#     return model, monthly_totals


# def predict_next_month(monthly_totals):
#     """Predict next month expense from historical monthly totals (linear regression)."""
#     model, values = train_monthly_model(monthly_totals)
#     if model is None:
#         return float(np.mean(values)) if values else 0.0
#     next_index = np.array([[len(values)]])
#     pred = model.predict(next_index)
#     return max(0.0, float(pred[0]))


# def predict_next_year_budget(monthly_totals):
#     """Predict next year budget (sum of next 12 months) from linear trend."""
#     model, values = train_monthly_model(monthly_totals)
#     if model is None:
#         avg = float(np.mean(values)) if values else 0.0
#         return avg * 12
#     total = 0.0
#     for i in range(len(values), len(values) + 12):
#         pred = model.predict(np.array([[i]]))
#         total += max(0.0, float(pred[0]))
#     return total


"""Simple forecasting utilities for IT Budget Buddy.

This version avoids heavy dependencies like scikit-learn and SciPy so it
works cleanly with Python 3.13.

It uses a basic linear regression formula over monthly totals:
    y = a + b * x
where x is the month index (0, 1, 2, ...).
"""


def _linear_regression(values):
    """
    Fit a simple y = a + b*x line to the given values.

    values: list[float] – monthly totals in chronological order.
    Returns (a, b) where:
      a = intercept, b = slope. If there is not enough data or variance
      in x, returns (mean(values), 0.0).
    """
    n = len(values)
    if n == 0:
        return 0.0, 0.0
    if n == 1:
        return float(values[0]), 0.0

    xs = list(range(n))
    sum_x = sum(xs)
    sum_y = float(sum(values))
    sum_xx = sum(x * x for x in xs)
    sum_xy = sum(x * float(y) for x, y in zip(xs, values))

    denom = n * sum_xx - sum_x * sum_x
    if denom == 0:
        mean_y = sum_y / n
        return mean_y, 0.0

    b = (n * sum_xy - sum_x * sum_y) / denom
    a = (sum_y - b * sum_x) / n
    return a, b


def predict_next_month(monthly_totals):
    """Predict next month expense from historical monthly totals."""
    if not monthly_totals:
        return 0.0

    a, b = _linear_regression([float(v) for v in monthly_totals])
    next_index = len(monthly_totals)
    pred = a + b * next_index
    return max(0.0, float(pred))


def predict_next_year_budget(monthly_totals):
    """Predict next year required budget as sum of next 12 months."""
    if not monthly_totals:
        return 0.0

    a, b = _linear_regression([float(v) for v in monthly_totals])
    n = len(monthly_totals)
    total = 0.0
    for i in range(n, n + 12):
        pred = a + b * i
        total += max(0.0, float(pred))
    return total    