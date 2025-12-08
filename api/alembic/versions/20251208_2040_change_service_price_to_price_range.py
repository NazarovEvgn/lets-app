"""change service price to price range

Revision ID: 7f8a9b0c1d2e
Revises: 0c69562e3747
Create Date: 2025-12-08 20:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f8a9b0c1d2e'
down_revision: Union[str, None] = '0c69562e3747'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns
    op.add_column('services', sa.Column('price_from', sa.Float(), nullable=True))
    op.add_column('services', sa.Column('price_to', sa.Float(), nullable=True))

    # Copy data from price to both price_from and price_to
    op.execute('UPDATE services SET price_from = price, price_to = price')

    # Make columns non-nullable
    op.alter_column('services', 'price_from', nullable=False)
    op.alter_column('services', 'price_to', nullable=False)

    # Drop old price column
    op.drop_column('services', 'price')


def downgrade() -> None:
    # Add back price column
    op.add_column('services', sa.Column('price', sa.Float(), nullable=True))

    # Copy data from price_from to price (use lower bound)
    op.execute('UPDATE services SET price = price_from')

    # Make column non-nullable
    op.alter_column('services', 'price', nullable=False)

    # Drop new columns
    op.drop_column('services', 'price_to')
    op.drop_column('services', 'price_from')
