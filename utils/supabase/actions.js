'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import {headers} from 'next/headers';

export async function signIn(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error , result } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { status: error.message, user: null }
  }

  revalidatePath('/', 'layout');
  return { status: "sucess" , user: result }
}

export async function signUp(formData) {
  const supabase = await createClient();

  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error , result } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  })

  if (error) {
    return { status: error.message, user: null }
  }
  else if(result?.user?.identities?.length === 0) {
    return { status: "user already exists" , user: null }
  }

  revalidatePath('/', 'layout')
  return { status: "sucess" , user: result }
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