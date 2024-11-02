import { NextRequest, NextResponse } from "next/server";
import Category from "@/modal/category";
import {connectDB} from "@/connectDB";
import SubCategory from "@/modal/subCategory";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, type } = await request.json();

    const newCategory = new Category({
      name,
      type,
    });

    await newCategory.save();
    return NextResponse.json({ message: "Category created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.code === 11000 ? "Category already exists" : "Internal Server Error" 
    }, { status: error.code === 11000 ? 400 : 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, name, type } = await request.json();

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { 
        name, 
        type 
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Category updated successfully",
      category: updatedCategory 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.code === 11000 ? "Category already exists" : "Internal Server Error" 
    }, { status: error.code === 11000 ? 400 : 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Delete associated subcategories first
    const subCategory = await  SubCategory.find({ categoryId: id });
    if(subCategory.length > 0){
      return NextResponse.json({ message: "Delete Sub-Categroyes First" }, { status: 200 });
    }else{
     await Category.findByIdAndDelete(id);
     return NextResponse.json({ 
      message: "Category and related subcategories deleted successfully" 
    }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
