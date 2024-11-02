import { NextRequest, NextResponse } from 'next/server';
import Admin from '@/modal/admin';
import {connectDB} from "@/connectDB";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('admin_session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Verify if admin exists in database
    await connectDB();
    const admin = await Admin.findOne({});

    if (!admin) {
      const response = NextResponse.json(
        { error: 'Admin not found' },
        { status: 401 }
      );
      response.cookies.delete('admin_session');
      return response;
    }

    return NextResponse.json(
      { 
        message: 'Session verified',
        admin: {
          adminId: admin.adminId,
          id: admin._id
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    const response = NextResponse.json(
      { error: 'Verification failed' },
      { status: 401 }
    );
    // Clear the session cookie if verification fails
    response.cookies.delete('admin_session');
    return response;
  }
}
