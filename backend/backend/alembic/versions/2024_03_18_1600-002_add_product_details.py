"""add product details and image

Revision ID: 002
Revises: 001
Create Date: 2024-03-18 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to products table
    op.add_column('products', sa.Column('image_url', sa.String(500), nullable=True))
    op.add_column('products', sa.Column('short_description', sa.String(500), nullable=True))
    op.add_column('products', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('products', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('products', sa.Column('discount_percentage', sa.Numeric(5, 2), nullable=True))
    
    # Add check constraint for discount percentage
    op.create_check_constraint(
        'check_discount_percentage',
        'products',
        'discount_percentage >= 0 AND discount_percentage <= 100'
    )


def downgrade() -> None:
    op.drop_constraint('check_discount_percentage', 'products', type_='check')
    op.drop_column('products', 'discount_percentage')
    op.drop_column('products', 'is_active')
    op.drop_column('products', 'description')
    op.drop_column('products', 'short_description')
    op.drop_column('products', 'image_url')
