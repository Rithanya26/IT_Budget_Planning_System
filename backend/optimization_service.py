"""Rule-based optimization suggestions for IT Budget Buddy."""
from __future__ import annotations

THRESHOLD_EXCEED_ALLOCATION = 0.15   # 15% over allocation -> suggest increase
THRESHOLD_UNDER_ALLOCATION = 0.15   # 15% under allocation -> suggest decrease
LOW_UTILIZATION = 70                # Below 70% for 2 consecutive years -> reallocate
GROWTH_RATE_HIGH = 0.20             # 20% growth -> recommend higher allocation


def generate_suggestions(
    department_id,
    department_name,
    allocated_budget,
    total_spending,
    forecast_next_year,
    utilization_current,
    utilization_previous,
    spending_current_year,
    spending_previous_year,
):
    """
    Generate optimization suggestions based on rules.
    All monetary values in same currency; utilization in 0-100 scale.
    """
    suggestions = []

    if allocated_budget <= 0:
        return suggestions

    # Rule 1: Forecasted next year exceeds current allocation by >15%
    if forecast_next_year > 0 and forecast_next_year > allocated_budget * (1 + THRESHOLD_EXCEED_ALLOCATION):
        pct_increase = ((forecast_next_year - allocated_budget) / allocated_budget) * 100
        suggestions.append(
            f"Forecasted next year spending (${forecast_next_year:,.0f}) exceeds current allocation by {pct_increase:.0f}%. "
            f"Recommend increasing allocation for {department_name} by approximately {pct_increase:.0f}%."
        )

    # Rule 2: Forecasted spending lower than allocation by >15%
    if forecast_next_year > 0 and forecast_next_year < allocated_budget * (1 - THRESHOLD_UNDER_ALLOCATION):
        pct_decrease = ((allocated_budget - forecast_next_year) / allocated_budget) * 100
        suggestions.append(
            f"Forecasted spending (${forecast_next_year:,.0f}) is below current allocation by {pct_decrease:.0f}%. "
            f"Consider reducing allocation for {department_name} to avoid surplus."
        )

    # Rule 3: Utilization below 70% for two consecutive years (we only have current and previous)
    if utilization_previous is not None and utilization_current < LOW_UTILIZATION and utilization_previous < LOW_UTILIZATION:
        suggestions.append(
            f"Utilization for {department_name} is below {LOW_UTILIZATION}% for two consecutive years. "
            f"Consider reallocating surplus to high-growth departments."
        )

    # Rule 4: Utilization exceeds 100% frequently (current year over 100%)
    if utilization_current >= 100:
        suggestions.append(
            f"{department_name} has exceeded allocated budget (utilization {utilization_current:.0f}%). "
            f"Recommend increasing base allocation to avoid overspend."
        )

    # Rule 5: Annual growth rate > 20%
    if spending_previous_year and spending_previous_year > 0:
        growth_rate = (spending_current_year - spending_previous_year) / spending_previous_year
        if growth_rate >= GROWTH_RATE_HIGH:
            suggestions.append(
                f"Annual spending growth for {department_name} is {(growth_rate * 100):.0f}% (above {GROWTH_RATE_HIGH * 100}%). "
                f"Recommend higher future allocation to accommodate growth."
            )

    return suggestions
