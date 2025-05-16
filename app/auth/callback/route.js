import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {

        const {data , error:userError} = await supabase.auth.getUser();
        if(userError) {
            console.log("error in fetching user", userError);
            return NextResponse.redirect(`${origin}/error`)
        }

        const {data:user , error:existingUser} = await supabase
        .from("Users")
        .select("*")
        .eq("eamil" , data.user.email)
        .single();
        

        if(!existingUser) {
            const { error:insertError } = await supabase.from("Users").insert({
                name: data.user.user_metadata.name,
                email: data.user.email,
                id : data.user.id,
                created_at : data.user.created_at,
                credits : 10
            })
    
            if(insertError) {
                console.log("error in inserting user", insertError);
                return NextResponse.redirect(`${origin}/error`)
            }
        }

        const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === 'development'
        if (isLocalEnv) {
            // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
            return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}