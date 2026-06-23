import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import os
from pathlib import Path
from datetime import datetime

st.set_page_config(
    page_title="AI Chatbot A/B | Licious",
    layout="wide",
    initial_sidebar_state="collapsed",
)

DATA = Path(__file__).resolve().parent / "data" / "ai_chatbot"
CTRL_COLOR = "#4C72B0"
TEST_COLOR = "#DD8452"


def _mtime(f: Path) -> str:
    return datetime.fromtimestamp(f.stat().st_mtime).strftime("%d %b %Y")


@st.cache_data
def load_metrics():
    f = DATA / "chatbot_metrics.csv"
    df = pd.read_csv(f)
    df = df[df["Variant Split"] == "All"].copy()
    return df, _mtime(f)


@st.cache_data
def load_gh():
    f = DATA / "gh_analysis.csv"
    return pd.read_csv(f), _mtime(f)


@st.cache_data
def load_retention():
    f = DATA / "retention.csv"
    df = pd.read_csv(f)
    for col in [c for c in df.columns if "%" in c]:
        df[col] = (
            df[col].astype(str).str.replace("%", "", regex=False).str.strip().astype(float)
        )
    return df, _mtime(f)


metrics_df, metrics_mtime = load_metrics()
gh_df, gh_mtime = load_gh()
ret_df, ret_mtime = load_retention()

# ─── HEADER ──────────────────────────────────────────────────────────────────
st.title("AI Chatbot A/B Test")
st.markdown(
    "**Guided Help (Control)** vs **AI Chatbot (Test)** · Apr – Jun 2026 · User-level assignment  \n"
    "_Users who select 'My Issue Is Not Listed' in Guided Help are routed to the AI Chatbot in the test arm._"
)
st.divider()

# ─── DERIVED NUMBERS ─────────────────────────────────────────────────────────
CORE_MONTHS = ["2026-04", "2026-05"]
ALL_MONTHS  = ["2026-04", "2026-05", "2026-06"]

# Opt-in rate — test rows, Apr+May
test_core = metrics_df[
    (metrics_df["Variant"] == "test") & (metrics_df["Month"].isin(CORE_MONTHS))
]
optin_pct: float | None = None
if not test_core.empty:
    total_convos = test_core["Total Convos"].sum()
    if total_convos > 0:
        optin_pct = (
            (test_core["Optin Rate %"] * test_core["Total Convos"]).sum() / total_convos * 100
        )

# Escalation & O2C — comparable bucket
ctrl_bucket = gh_df[
    (gh_df["Variant"] == "control") &
    (gh_df["GH Bucket"] == "Clicked - Other Issues") &
    (gh_df["Month"].isin(CORE_MONTHS))
]
test_bucket = gh_df[
    (gh_df["Variant"] == "test") &
    (gh_df["GH Bucket"] == "Clicked - My Issue Is Not Listed") &
    (gh_df["Month"].isin(CORE_MONTHS))
]

avg_esc_ctrl = ctrl_bucket["Suggested to Agent %"].mean() * 100 if not ctrl_bucket.empty else 0
avg_esc_test = test_bucket["Suggested to Agent %"].mean() * 100 if not test_bucket.empty else 0
avg_o2c_ctrl = ctrl_bucket["O2C"].mean() * 100 if not ctrl_bucket.empty else 0
avg_o2c_test = test_bucket["O2C"].mean() * 100 if not test_bucket.empty else 0

# Test group size
test_shipments = gh_df[
    (gh_df["Variant"] == "test") &
    (gh_df["GH Bucket"] == "All") &
    (gh_df["GH Outcome"] == "Total") &
    (gh_df["Month"].isin(ALL_MONTHS))
]["Shipment (Variant Level)"].sum()

# ─── KPI CARDS ───────────────────────────────────────────────────────────────
c1, c2, c3, c4 = st.columns(4)

with c1:
    val = f"{optin_pct:.0f}%" if optin_pct is not None else "N/A"
    st.metric(
        "Opt-in Rate",
        val,
        help="% of test-arm users who engaged with the AI Chatbot (Apr–May avg)",
    )

with c2:
    if avg_esc_ctrl > 0:
        delta = avg_esc_test - avg_esc_ctrl
        st.metric(
            "Escalation Rate",
            f"{avg_esc_test:.0f}%",
            delta=f"{delta:+.0f}pp vs Control ({avg_esc_ctrl:.0f}%)",
            delta_color="inverse",
            help="% of users escalated to a human agent. Lower is better.",
        )

with c3:
    if avg_o2c_ctrl > 0:
        delta = avg_o2c_test - avg_o2c_ctrl
        st.metric(
            "Ticket Creation (O2C)",
            f"{avg_o2c_test:.0f}%",
            delta=f"{delta:+.0f}pp vs Control ({avg_o2c_ctrl:.0f}%)",
            delta_color="inverse",
            help="Tickets raised per support interaction. Lower = fewer formal tickets.",
        )

with c4:
    st.metric(
        "Test Group Size",
        f"{int(test_shipments):,}",
        help="Unique shipments in test flow (Apr–Jun)",
    )

st.divider()

# ─── MONTHLY TRENDS ──────────────────────────────────────────────────────────
MONTH_LABELS = {"2026-04": "Apr '26", "2026-05": "May '26", "2026-06": "Jun '26"}

ctrl_m = (
    gh_df[
        (gh_df["Variant"] == "control") &
        (gh_df["GH Bucket"] == "Clicked - Other Issues") &
        (gh_df["Month"].isin(ALL_MONTHS))
    ].set_index("Month")
)
test_m = (
    gh_df[
        (gh_df["Variant"] == "test") &
        (gh_df["GH Bucket"] == "Clicked - My Issue Is Not Listed") &
        (gh_df["Month"].isin(ALL_MONTHS))
    ].set_index("Month")
)

x_labels = [MONTH_LABELS[m] for m in ALL_MONTHS]


def get_series(df: pd.DataFrame, col: str, months: list, scale: float = 1.0):
    return [
        float(df.loc[m, col]) * scale if m in df.index else None
        for m in months
    ]


def line_chart(ctrl_y, test_y, x, yaxis_title, y_range) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=x, y=ctrl_y,
        name="Control (Guided Help)",
        line=dict(color=CTRL_COLOR, width=2),
        mode="lines+markers", marker=dict(size=8),
    ))
    fig.add_trace(go.Scatter(
        x=x, y=test_y,
        name="Test (AI Chatbot)",
        line=dict(color=TEST_COLOR, width=2),
        mode="lines+markers", marker=dict(size=8),
    ))
    fig.update_layout(
        yaxis_title=yaxis_title,
        yaxis=dict(ticksuffix="%", range=y_range),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=0, r=0, t=30, b=0),
        height=300,
        plot_bgcolor="white",
        paper_bgcolor="white",
    )
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(gridcolor="#eeeeee")
    return fig


col_l, col_r = st.columns(2)

with col_l:
    st.subheader("Escalation Rate")
    st.caption("% escalated to human agent · 'Other Issues' bucket (comparable segment)")
    fig = line_chart(
        get_series(ctrl_m, "Suggested to Agent %", ALL_MONTHS, scale=100),
        get_series(test_m, "Suggested to Agent %", ALL_MONTHS, scale=100),
        x_labels, "Escalation %", [0, 110],
    )
    st.plotly_chart(fig, use_container_width=True)

with col_r:
    st.subheader("Ticket Creation Rate (O2C)")
    st.caption("Tickets per support interaction · 'Other Issues' bucket")
    fig = line_chart(
        get_series(ctrl_m, "O2C", ALL_MONTHS, scale=100),
        get_series(test_m, "O2C", ALL_MONTHS, scale=100),
        x_labels, "O2C %", [0, 80],
    )
    st.plotly_chart(fig, use_container_width=True)

st.divider()

# ─── RETENTION ───────────────────────────────────────────────────────────────
st.subheader("Retention & Return Rate")
st.caption(
    "Control period: Jan–Mar 2026 (pre-experiment baseline) · "
    "Test period: Apr–Jun 2026 · Full cohort ('All' group)"
)

ret_ctrl = ret_df[(ret_df["Variant"] == "control") & (ret_df["Group"] == "All")]
ret_test  = ret_df[(ret_df["Variant"] == "test")    & (ret_df["Group"] == "All")]
windows = ["7D", "14D", "28D"]


def bar_chart(ctrl_vals, test_vals, yaxis_title, y_range) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(go.Bar(
        name="Control", x=windows, y=ctrl_vals,
        marker_color=CTRL_COLOR,
        text=[f"{v:.1f}%" for v in ctrl_vals], textposition="outside",
    ))
    fig.add_trace(go.Bar(
        name="Test", x=windows, y=test_vals,
        marker_color=TEST_COLOR,
        text=[f"{v:.1f}%" for v in test_vals], textposition="outside",
    ))
    fig.update_layout(
        barmode="group",
        yaxis_title=yaxis_title,
        yaxis=dict(ticksuffix="%", range=y_range),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=0, r=0, t=30, b=0),
        height=320,
        plot_bgcolor="white",
        paper_bgcolor="white",
    )
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(gridcolor="#eeeeee")
    return fig


def ret_vals(df, metric_prefix):
    if df.empty:
        return [0, 0, 0]
    return [float(df[f"{metric_prefix} {w} %"].values[0]) for w in windows]


col_rl, col_rr = st.columns(2)

with col_rl:
    st.markdown("**Retention Rate** — returned to use Guided Help")
    fig = bar_chart(
        ret_vals(ret_ctrl, "Retention"),
        ret_vals(ret_test, "Retention"),
        "Retention %", [0, 75],
    )
    st.plotly_chart(fig, use_container_width=True)

with col_rr:
    st.markdown("**Return Rate** — placed another order")
    fig = bar_chart(
        ret_vals(ret_ctrl, "Return Rate"),
        ret_vals(ret_test, "Return Rate"),
        "Return Rate %", [0, 100],
    )
    st.plotly_chart(fig, use_container_width=True)

# ─── FOOTER ──────────────────────────────────────────────────────────────────
st.divider()
st.caption(f"Data last refreshed: {metrics_mtime}")
