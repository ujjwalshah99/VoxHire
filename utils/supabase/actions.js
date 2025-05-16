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

export async function getUserSession() {
  const supabase = await createClient()

  const {data: { session } , error} = await supabase.auth.getSession()


  if(error) {
    return null
  }

  return {status : "success" , session : session }
}