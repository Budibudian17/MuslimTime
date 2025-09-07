import { NextRequest, NextResponse } from 'next/server';
import { markEmailAsVerified } from '@/lib/services/userVerification';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    console.log('🔧 Manually marking email as verified:', email);
    const result = await markEmailAsVerified(email);
    
    if (result.success) {
      console.log('✅ Email marked as verified successfully:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'Email marked as verified successfully' 
      });
    } else {
      console.error('❌ Failed to mark email as verified:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Error in mark-email-verified API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
