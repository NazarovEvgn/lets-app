"""add employee photos and services relationship

Revision ID: 9h0c1d2e3f4g
Revises: 8g9b0c1d2e3f
Create Date: 2025-12-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9h0c1d2e3f4g'
down_revision: Union[str, None] = '8g9b0c1d2e3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add photo_url column to employees
    op.add_column('employees', sa.Column('photo_url', sa.String(length=500), nullable=True))

    # Remove position column (no longer used)
    op.drop_column('employees', 'position')

    # Create employee_services association table
    op.create_table(
        'employee_services',
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('service_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('employee_id', 'service_id')
    )


def downgrade() -> None:
    # Drop employee_services table
    op.drop_table('employee_services')

    # Add back position column
    op.add_column('employees', sa.Column('position', sa.String(length=100), nullable=True))

    # Drop photo_url column
    op.drop_column('employees', 'photo_url')
