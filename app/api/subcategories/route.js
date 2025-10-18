// app/api/subcategories/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import SubCategory from '@/models/SubCategory';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    
    let query = {};
    if (activeOnly) query.isActive = true;
    if (category) query.category = category;
    
    const subCategories = await SubCategory.find(query)
      .populate('category', 'name')
      .sort({ order: 1, name: 1 });

    return new Response(JSON.stringify(subCategories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('SubCategories fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subcategories' }), {
      status: 500,
    });
  }
}

export async function POST(request) {
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

    const subCategoryData = await request.json();
    await dbConnect();

    // Validate category exists
    const categoryExists = await Category.findById(subCategoryData.category);
    if (!categoryExists) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 400,
      });
    }

    // Check if subcategory with same name already exists in this category
    const existingSubCategory = await SubCategory.findOne({
      category: subCategoryData.category,
      name: { $regex: new RegExp(`^${subCategoryData.name}$`, 'i') }
    });
    
    if (existingSubCategory) {
      return new Response(JSON.stringify({ error: 'SubCategory with this name already exists in this category' }), {
        status: 400,
      });
    }

    const subCategory = new SubCategory(subCategoryData);
    await subCategory.save();

    // Update category's subCategories array
    await Category.findByIdAndUpdate(
      subCategoryData.category,
      { $addToSet: { subCategories: subCategory._id } }
    );

    const populatedSubCategory = await SubCategory.findById(subCategory._id)
      .populate('category', 'name');

    return new Response(JSON.stringify(populatedSubCategory), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('SubCategory creation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create subcategory' }), {
      status: 500,
    });
  }
}