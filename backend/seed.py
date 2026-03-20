"""
seed.py — Populate the database with sample notes for testing
Run: python seed.py
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, AsyncSessionLocal
from models import Note

SAMPLE_NOTES = [
    ("Welcome to Notara 👋", "This is your first note! You can edit it, search for it, or delete it. Try the search bar up top to find notes by keyword."),
    ("Meeting Notes — Q1 Planning", "Discussed roadmap priorities:\n- Launch v2 by end of March\n- Improve onboarding flow\n- Add analytics dashboard\n\nAction items: Sarah owns design mockups, Dev team owns backend refactor."),
    ("Recipe: Sourdough Bread", "Ingredients:\n- 500g bread flour\n- 375ml warm water\n- 100g starter\n- 10g salt\n\nMethod: Mix flour and water, autolyse 30 min. Add starter and salt. Stretch & fold every 30 min for 3 hours. Shape and proof overnight in fridge. Bake at 250°C for 20 min covered, 25 min uncovered."),
    ("Book List 2025", "Currently reading:\n✓ The Design of Everyday Things — Don Norman\n→ Thinking Fast and Slow — Kahneman\n→ Atomic Habits — James Clear\n\nWant to read:\n- Deep Work by Cal Newport\n- The Pragmatic Programmer"),
    ("Python Tips & Tricks", "# Useful one-liners\nflatten = [x for xs in nested for x in xs]\nzip_dict = dict(zip(keys, values))\ngroup_by = {k: list(v) for k, v in groupby(data, key)}\n\n# Walrus operator\nif (n := len(data)) > 10:\n    print(f'Too many items: {n}')"),
    ("Travel Packing List", "Electronics:\n□ Laptop + charger\n□ USB-C hub\n□ Power bank 20000mAh\n□ Noise-cancelling headphones\n\nClothing (7 days):\n□ 7 t-shirts\n□ 3 pants\n□ 1 light jacket\n\nDocuments:\n□ Passport\n□ Travel insurance\n□ Hotel confirmations"),
    ("Ideas Dump 💡", "- Build a CLI tool for markdown note-taking\n- Write a blog post about SQLite FTS5\n- Learn Rust basics\n- Contribute to an open source Angular library\n- Create a personal finance dashboard"),
    ("Standup Notes", "Yesterday: Fixed the search ranking bug, reviewed 3 PRs\nToday: Working on pagination, writing unit tests\nBlockers: Waiting for design feedback on the modal layout"),
]

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for title, content in SAMPLE_NOTES:
            session.add(Note(title=title, content=content))
        await session.commit()
    print(f"✅ Seeded {len(SAMPLE_NOTES)} notes successfully.")

if __name__ == "__main__":
    asyncio.run(seed())
