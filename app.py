import streamlit as st

st.set_page_config(
    page_title="Licious Analytics",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.title("Licious — Product Analytics")
st.markdown("Select a report from the sidebar.")

st.divider()

reports = [
    ("AI Chatbot A/B Test", "Guided Help vs AI Chatbot · Apr–Jun 2026", "AI_Chatbot"),
]

for name, description, _ in reports:
    with st.container(border=True):
        st.markdown(f"**{name}**")
        st.caption(description)
