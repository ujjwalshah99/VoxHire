import { NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile, getUserByEmail, createOrUpdateUser } from '@/utils/database/operations';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    // Get user profile
    let profile;
    try {
      profile = await getUserProfile(userEmail);
    } catch (err) {
      // Create default profile if doesn't exist
      profile = await updateUserProfile(userEmail, {
        bio: '',
        skills: [],
        achievements: [],
        preferences: {}
      });
    }

    // Get user data
    let user;
    try {
      user = await getUserByEmail(userEmail);
    } catch (err) {
      // User might not exist in Users table yet
      user = null;
    }

    return NextResponse.json({
      ...profile,
      user: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { userEmail, ...updates } = data;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    // Update profile
    const updatedProfile = await updateUserProfile(userEmail, updates);
    
    // If user data is included, update Users table too
    if (updates.name || updates.subscription_tier) {
      try {
        await createOrUpdateUser({
          email: userEmail,
          name: updates.name,
          subscription_tier: updates.subscription_tier
        });
      } catch (err) {
        console.log('Could not update user data:', err);
      }
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { userEmail, action, ...params } = data;
    
    if (!userEmail || !action) {
      return NextResponse.json({ error: 'userEmail and action are required' }, { status: 400 });
    }

    switch (action) {
      case 'addSkill':
        const { skill } = params;
        if (!skill) {
          return NextResponse.json({ error: 'skill is required' }, { status: 400 });
        }
        
        // Get current profile
        const profile = await getUserProfile(userEmail);
        const currentSkills = profile.skills || [];
        
        // Add skill if not already present
        if (!currentSkills.includes(skill)) {
          const updatedSkills = [...currentSkills, skill];
          const updated = await updateUserProfile(userEmail, { skills: updatedSkills });
          return NextResponse.json(updated);
        }
        return NextResponse.json(profile);
        
      case 'removeSkill':
        const { skillToRemove } = params;
        if (!skillToRemove) {
          return NextResponse.json({ error: 'skillToRemove is required' }, { status: 400 });
        }
        
        const currentProfile = await getUserProfile(userEmail);
        const filteredSkills = (currentProfile.skills || []).filter(s => s !== skillToRemove);
        const updatedProfile = await updateUserProfile(userEmail, { skills: filteredSkills });
        return NextResponse.json(updatedProfile);
        
      case 'unlockAchievement':
        const { achievement } = params;
        if (!achievement) {
          return NextResponse.json({ error: 'achievement is required' }, { status: 400 });
        }
        
        const userProfile = await getUserProfile(userEmail);
        const currentAchievements = userProfile.achievements || [];
        
        // Add achievement if not already unlocked
        const achievementExists = currentAchievements.some(a => a.id === achievement.id);
        if (!achievementExists) {
          const updatedAchievements = [...currentAchievements, {
            ...achievement,
            unlockedAt: new Date().toISOString()
          }];
          const result = await updateUserProfile(userEmail, { achievements: updatedAchievements });
          return NextResponse.json(result);
        }
        return NextResponse.json(userProfile);
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing profile action:', error);
    return NextResponse.json({ error: 'Failed to process profile action' }, { status: 500 });
  }
}
