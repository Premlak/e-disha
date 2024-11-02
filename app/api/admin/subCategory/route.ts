import { NextRequest, NextResponse } from "next/server";
import Category from "@/modal/category";
import SubCategory from "@/modal/subCategory";
import Product from "@/modal/stock";
import {connectDB} from "@/connectDB";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, categoryId } = await request.json();

    const newSubCategory = new SubCategory({
      name,
      categoryId,
    });

    await newSubCategory.save();
    return NextResponse.json({ message: "SubCategory created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.code === 11000 ? "SubCategory already exists" : "Internal Server Error" 
    }, { status: error.code === 11000 ? 400 : 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let categories;
    if (type) {
      // If type is provided, filter categories
      categories = await Category.find({ type });
    } else {
      // If no type, get all categories
      categories = await Category.find({});
    }

    // Get all subcategories with populated category information
    const subCategories = await SubCategory.find({})
      .populate('categoryId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      categories,
      subCategories
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, name } = await request.json();

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { name },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedSubCategory) {
      return NextResponse.json({ error: "SubCategory not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "SubCategory updated successfully",
      subCategory: updatedSubCategory 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "SubCategory ID is required" }, { status: 400 });
    }
    const product = await Product.find({subCategory: id});
    if(product.length > 0){
      return NextResponse.json({ 
        message: "Delete The Stock Entry if Possible" 
      }, { status: 200 });
    }else{
      await SubCategory.findByIdAndDelete(id);
      return NextResponse.json({ 
        message: "SubCategory deleted successfully" 
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
