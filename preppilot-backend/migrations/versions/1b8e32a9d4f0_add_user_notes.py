"""add user notes

Revision ID: 1b8e32a9d4f0
Revises: 88db45746961
Create Date: 2026-10-09
"""

from alembic import op
import sqlalchemy as sa


revision = "1b8e32a9d4f0"
down_revision = "88db45746961"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("notes", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_notes_user_id"), ["user_id"], unique=False)


def downgrade():
    with op.batch_alter_table("notes", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_notes_user_id"))
    op.drop_table("notes")
