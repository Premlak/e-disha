import { NextRequest, NextResponse } from "next/server";
import MOP from "@/modal/mop";
import {connectDB} from "@/connectDB";
import Product from "@/modal/stock";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name } = await request.json();

    const mop = await MOP.create({ name });
    return NextResponse.json({ mop }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const mops = await MOP.find({});
    return NextResponse.json({ mops });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, name } = await request.json();
    const mop = await MOP.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    return NextResponse.json({ mop });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { id } = await request.json();
    const product = await Product.find({mop: id});
    if(product.length > 0){
      return NextResponse.json({ message: "Delete Stock Entry if Possible" });
    }else{
    await MOP.findByIdAndDelete(id);
    return NextResponse.json({ message: "Mode of Purchase deleted successfully" });
  }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
