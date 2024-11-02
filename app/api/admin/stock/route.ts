import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/connectDB";
import Product from "@/modal/stock";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    data.issued = false;
    const existingProduct = await Product.findOne({
      serialNumber: data.serialNumber,
      billNumber: data.billNumber,
      category: data.category,
      subCategory: data.subCategory,
      brand: data.brand,
      modal: data.modal
    });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with these details already exists" },
        { status: 400 }
      );
    }
    const product = await Product.create(data);
    const populatedProduct = await product.populate([
      'category',
      'subCategory',
      'brand',
      'modal',
      'mop',
      'vendor'
    ]);
    return NextResponse.json({ product: populatedProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filters: any = {};
    const basicParams = [
      'category', 'subCategory', 'brand',
      'modal', 'mop', 'vendor'
    ];

    basicParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        filters[param] = value;
      }
    });

    // Text search filters
    const textParams = ['serialNumber', 'productNumber', 'billNumber'];
    textParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        filters[param] = { $regex: value, $options: 'i' }; // Case-insensitive partial match
      }
    });

    // Date range filter
    const billDate = searchParams.get('billDate');
    if (billDate) {
      const date = new Date(billDate);
      filters.billDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const products = await Product.find(filters)
      .populate([
        'category',
        'subCategory',
        'brand',
        'modal',
        'mop',
        'vendor'
      ])
      .sort({ createdAt: -1 });

    return NextResponse.json({ products });
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
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // If this is an issue request (will have user field)
    if (data.user) {
      // Update with all fields explicitly
      const updateData = {
        issued: true,
        issuedDate: new Date().toISOString(), // Ensure proper date format
        user: data.user, // This should be the user's _id
        // Include all other existing fields to preserve them
        category: data.category,
        subCategory: data.subCategory,
        brand: data.brand,
        modal: data.modal,
        mop: data.mop,
        vendor: data.vendor,
        serialNumber: data.serialNumber,
        productNumber: data.productNumber,
        billNumber: data.billNumber,
        billDate: data.billDate
      };

      // Do the update with all fields
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true,
          runValidators: true // This ensures all validations run
        }
      ).populate([
        { path: 'category', select: 'name' },
        { path: 'subCategory', select: 'name' },
        { path: 'brand', select: 'name' },
        { path: 'modal', select: 'name' },
        { path: 'mop', select: 'name' },
        { path: 'vendor', select: 'name' },
        { path: 'user', select: 'username mobileNumber address' }
      ]);

      if (!updatedProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Verify the update
      console.log('Updated Product:', updatedProduct);

      return NextResponse.json({ product: updatedProduct });
    } 
    // If this is a regular update
    else {
      data.issued = false;
      data.user = null; // Reset user field for regular updates
      data.issuedDate = null; // Reset issuedDate field for regular updates
      
      const existingProduct = await Product.findOne({
        _id: { $ne: id },
        serialNumber: data.serialNumber,
        billNumber: data.billNumber,
        category: data.category,
        subCategory: data.subCategory,
        brand: data.brand,
        modal: data.modal
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: "Update would create a duplicate product" },
          { status: 400 }
        );
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        data,
        { 
          new: true,
          runValidators: true
        }
      ).populate([
        { path: 'category', select: 'name' },
        { path: 'subCategory', select: 'name' },
        { path: 'brand', select: 'name' },
        { path: 'modal', select: 'name' },
        { path: 'mop', select: 'name' },
        { path: 'vendor', select: 'name' }
      ]);

      if (!updatedProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ product: updatedProduct });
    }
  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const {id} = await  request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    if (product.issued) {
      return NextResponse.json(
        { error: "Cannot delete an issued product" },
        { status: 400 }
      );
    }
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
