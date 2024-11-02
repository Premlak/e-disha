import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/connectDB";
import Modal from "@/modal/modal";
import Brand from "@/modal/brand";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name } = await request.json();
    const brand = await Brand.create({ name });
    return NextResponse.json({ brand }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({});
    return NextResponse.json({ brands });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, name } = await request.json();
    const brand = await Brand.findByIdAndUpdate(
      id,
      { name  },
      { new: true }
    );
    return NextResponse.json({ brand });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { id } = await request.json();
    const modal = await Modal.find({brandId: id});
    if(modal.length > 0){
      return NextResponse.json({ message: "Firstly Delete All Sub-Modal of this Brand" });
    }else{
      await Brand.findByIdAndDelete(id);
      return NextResponse.json({ message: "Brand deleted successfully" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
