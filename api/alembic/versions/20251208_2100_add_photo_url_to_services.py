"""add photo_url to services

Revision ID: 8g9b0c1d2e3f
Revises: 7f8a9b0c1d2e
Create Date: 2025-12-08 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8g9b0c1d2e3f'
down_revision: Union[str, None] = '7f8a9b0c1d2e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add photo_url column
    op.add_column('services', sa.Column('photo_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    # Drop photo_url column
    op.drop_column('services', 'photo_url')
