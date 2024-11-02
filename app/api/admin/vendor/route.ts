import { NextRequest, NextResponse } from "next/server";
import Vendor from "@/modal/vendor";
import Product from "@/modal/stock";
import {connectDB} from "@/connectDB";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, address, mobile } = await request.json();

    const vendor = await Vendor.create({
      name,
      address,
      mobile
    });
    
    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const vendors = await Vendor.find({}).sort({ vendorId: 1 });
    return NextResponse.json({ vendors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { id, name, address, mobile } = await request.json();
    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { name, address, mobile },
      { new: true }
    );
    return NextResponse.json({ vendor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { id } = await request.json();
    const product = await Product.find({vendor: id});
    if(product.length > 0){
      return NextResponse.json({ message: "Delete Stock Entry if Possible" });
    }else{
      await Vendor.findByIdAndDelete(id);
      return NextResponse.json({ message: "Vendor deleted successfully" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
