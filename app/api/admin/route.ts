import { NextRequest, NextResponse } from 'next/server';
import Admin from '@/modal/admin';
import {connectDB} from "@/connectDB";

// Simple function to create a session token
const generateSessionToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { adminId, password } = body;

    if (!adminId || !password) {
      return NextResponse.json(
        { error: 'Admin ID and password are required' },
        { status: 400 }
      );
    }

    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      // No admin exists, create new admin
      const newAdmin = new Admin({
        adminId,
        password, // In a real application, you might want to add some basic encryption
      });
      
      await newAdmin.save();
      
      const sessionToken = generateSessionToken();

      const response = NextResponse.json(
        { message: 'Admin created successfully' },
        { status: 201 }
      );

      // Set session cookie that expires when browser closes
      response.cookies.set({
        name: 'admin_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
        // Not setting maxAge or expires means it's a session cookie
      });

      return response;
    } else {
      // Admin exists, verify credentials
      const admin = await Admin.findOne({ adminId, password });
      
      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const sessionToken = generateSessionToken();

      const response = NextResponse.json(
        { 
          message: 'Login successful',
          admin: {
            adminId: admin.adminId,
            id: admin._id
          }
        },
        { status: 200 }
      );

      // Set session cookie that expires when browser closes
      response.cookies.set({
        name: 'admin_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
        // Not setting maxAge or expires means it's a session cookie
      });

      return response;
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify session endpoint
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('admin_session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Since we're using session cookies, if the cookie exists,
    // it means the browser session is still active
    return NextResponse.json(
      { message: 'Session valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session verification error:', error);
    const response = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
    response.cookies.delete('admin_session');
    return response;
  }
}

// Helper function to validate session in other routes
export const validateSession = (request: NextRequest) => {
  const sessionCookie = request.cookies.get('admin_session');
  return !!sessionCookie?.value;
};
