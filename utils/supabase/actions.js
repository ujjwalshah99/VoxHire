'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import {headers} from 'next/headers';

export async function signIn(formData) {
  const supabase = await createClient()

  const credentials = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error , data } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { status: error.message, user: null }
  }

  revalidatePath('/', 'layout');
  return { status: "success" , user: data }
}

export async function signUp(formData) {
  const supabase = await createClient();

  const credentials = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error , data } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        name: credentials.name,
      },
    },
  })

  if (error) {
    return { status: error.message, user: null }
  }
  else if(data?.user?.identities?.length === 0) {
    return { status: "user already exists" , user: null }
  }

  const { error : insertError } = await supabase.from("Users").insert({
    name: credentials.name,
    email: credentials.email,
    id : data.user.id,
    created_at : data.user.created_at,
    credits : 10
  })

  if(insertError) {
    return { status: insertError.message, user: null }
  }

  revalidatePath('/', 'layout')
  return { status: "success" , user: data }
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout')
  return { status: "success" }
}

export async function getUser() {
  const supabase = await createClient()

  const {data , error} = await supabase.auth.getUser()


  if(error) {
    return null
  }

  return {status : "success" , data : data }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { error , data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    }
  })

  if (error) {
    redirect("/error")
  }

  if(data?.url) {
    redirect(data.url)
  }

  revalidatePath('/', 'layout')
  return { status: "success" , user: data }
}

export async function forgotPassword(formData) {
  const supabase = await createClient();
  const origin = (await headers()).get('origin')

  // Get email as a string
  const email = formData.get("email");

  try {
    // Make sure email is passed as a string, not an object
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${origin}/auth/reset-password`,
      }
    );

    if (error) {
      console.error("Password reset error:", error.message);
      return { status: error.message }
    }

    return { status: "success" }
  } catch (err) {
    console.error("Exception in password reset:", err);
    return { status: err.message || "An unexpected error occurred" }
  }
}

export async function resetPassword(formData , code) {
  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Error exchanging code for session:", error.message);
    return { status: error.message }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: formData.get("password"),
  });

  if (updateError) {
    console.error("Error updating user:", updateError.message);
    return { status: updateError.message }
  }

  return { status: "success" }
}