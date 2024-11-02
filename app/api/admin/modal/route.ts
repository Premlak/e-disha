import { NextRequest, NextResponse } from "next/server";
import Modal from "@/modal/modal";
import {connectDB} from "@/connectDB";
import Product from "@/modal/stock";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, brandId } = await request.json();

    const modal = await Modal.create({ name, brandId });
    return NextResponse.json({ modal }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    
    const query = brandId ? { brandId } : {};
    const modals = await Modal.find(query).populate('brandId');
    return NextResponse.json({ modals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, name, brandId } = await request.json();
    const modal = await Modal.findByIdAndUpdate(
      id,
      { name, brandId },
      { new: true }
    );
    return NextResponse.json({ modal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { id } = await request.json();
    const product = await Product.find({modal: id})
    if(product.length > 0){
      return NextResponse.json({ message: "Delete The Stock Entry If Possible" });
    }else{
      await Modal.findByIdAndDelete(id);
      return NextResponse.json({ message: "Modal deleted successfully" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
