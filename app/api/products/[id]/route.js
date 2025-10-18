// app/api/products/[id]/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import Product from '@/models/Product';
import dbConnect from '@/lib/dbConnect';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params; // Destructure params properly
    
    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('collection', 'name');

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch product' }), {
      status: 500,
    });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
      });
    }

    const productData = await request.json();
    await dbConnect();

    const product = await Product.findByIdAndUpdate(
      params.id,
      productData,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('collection', 'name');

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Product update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update product' }), {
      status: 500,
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
      });
    }

    await dbConnect();

    const product = await Product.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: 'Product deactivated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Product delete error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete product' }), {
      status: 500,
    });
  }
}