// app/api/cart/route.js
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import  authOptions  from '@/lib/authOptions';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import  connectToDB  from '@/lib/dbConnect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    let cart = await Cart.findOne({ user: session.user.id })
      .populate('items.product')
      .populate('items.product.category')
      .populate('items.product.subCategory')
      .populate('items.product.collection');

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: [],
        total: 0,
        itemCount: 0
      });
    }

    return NextResponse.json({
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, size, color, quantity = 1 } = await req.json();

    if (!productId || !size) {
      return NextResponse.json({ error: 'Product ID and size are required' }, { status: 400 });
    }

    await connectToDB();

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => 
        item.product.toString() === productId && 
        item.size === size && 
        item.color?.name === color?.name
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        size,
        color,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product');

    return NextResponse.json({
      message: 'Item added to cart',
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    });
  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 });
    }

    await connectToDB();

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.pull({ _id: itemId });
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product');

    return NextResponse.json({
      message: 'Cart updated',
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    });
  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    await connectToDB();

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (itemId) {
      // Remove specific item
      cart.items.pull({ _id: itemId });
    } else {
      // Clear entire cart
      cart.items = [];
    }

    await cart.save();
    await cart.populate('items.product');

    return NextResponse.json({
      message: itemId ? 'Item removed from cart' : 'Cart cleared',
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    });
  } catch (error) {
    console.error('Cart delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}