import { NextResponse } from 'next/server';
import { getUserByEmail, createOrUpdateUser, updateUserCredits } from '@/utils/database/operations';
import { getUserBillingInfo } from '@/utils/userUtils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Use the utility function to get billing info
    const billingInfo = await getUserBillingInfo(userEmail);
    
    if (!billingInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(billingInfo);
  } catch (error) {
    console.error('Error fetching billing info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { userEmail, action, ...params } = data;
    
    if (!userEmail || !action) {
      return NextResponse.json(
        { error: 'userEmail and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'updateSubscription':
        const { tier, expires_at } = params;
        if (!tier) {
          return NextResponse.json({ error: 'tier is required' }, { status: 400 });
        }
        
        const updatedUser = await createOrUpdateUser({
          email: userEmail,
          subscription_tier: tier,
          subscription_expires_at: expires_at || null,
          credits: getCreditsForTier(tier)
        });
        
        return NextResponse.json({
          message: 'Subscription updated successfully',
          user: updatedUser,
          features: getPlanFeatures(tier)
        });
        
      case 'addCredits':
        const { credits } = params;
        if (!credits || credits <= 0) {
          return NextResponse.json({ error: 'Valid credits amount is required' }, { status: 400 });
        }
        
        await updateUserCredits(userEmail, credits);
        const user = await getUserByEmail(userEmail);
        
        return NextResponse.json({
          message: 'Credits added successfully',
          credits: user.credits
        });
        
      case 'useCredits':
        const { amount } = params;
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
        }
        
        await updateUserCredits(userEmail, -amount);
        const userAfterDeduction = await getUserByEmail(userEmail);
        
        return NextResponse.json({
          message: 'Credits used successfully',
          credits: userAfterDeduction.credits
        });
        
      case 'generateInvoice':
        // In a real implementation, this would integrate with Stripe or similar
        return NextResponse.json({
          message: 'Invoice generation not yet implemented',
          invoice_url: null
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing billing action:', error);
    return NextResponse.json(
      { error: 'Failed to process billing action' },
      { status: 500 }
    );
  }
}

function getPlanFeatures(tier) {
  const plans = {
    'free': {
      interviews_per_month: 5,
      practice_sessions_per_month: 10,
      ai_feedback: true,
      analytics: 'basic',
      support: 'community',
      credits_per_month: 10
    },
    'pro': {
      interviews_per_month: 50,
      practice_sessions_per_month: 100,
      ai_feedback: true,
      analytics: 'advanced',
      support: 'email',
      credits_per_month: 100,
      custom_questions: true,
      priority_support: true
    },
    'enterprise': {
      interviews_per_month: -1, // unlimited
      practice_sessions_per_month: -1, // unlimited
      ai_feedback: true,
      analytics: 'enterprise',
      support: 'dedicated',
      credits_per_month: 500,
      custom_questions: true,
      priority_support: true,
      team_management: true,
      api_access: true
    }
  };
  
  return plans[tier] || plans['free'];
}

function getCreditsForTier(tier) {
  const credits = {
    'free': 10,
    'pro': 100,
    'enterprise': 500
  };
  
  return credits[tier] || 10;
}
