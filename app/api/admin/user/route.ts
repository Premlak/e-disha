import { NextRequest, NextResponse } from "next/server";
import User from "@/modal/user";
import Product from "@/modal/stock";
import {connectDB} from "@/connectDB";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    // Check if user with same username exists
    const existingUser = await User.findOne({ username: data.mobileNumber });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const user = await User.create(data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).sort({ username: 1 });
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Check if username is being changed and if it's already taken
    const existingUser = await User.findOne({ 
      username: data.username,
      _id: { $ne: id }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user has any issued products
    const issuedProducts = await Product.findOne({ user: id, issued: true });
    
    if (issuedProducts) {
      return NextResponse.json({
        error: "Cannot delete user with issued products"
      }, { status: 400 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({
      message: "User deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
