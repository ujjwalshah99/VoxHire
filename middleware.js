import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request) {
  // First, update the user's auth session
  const response = await updateSession(request)

  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  if (pathname == "/") {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Public paths that are always accessible without authentication
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/confirm',
    '/api', // Allow API routes
    '/_next', // Next.js system routes
    '/dashboard',
    '/settings',
  ]

  // Check if the current path is a public path or a static asset
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) ||
                       pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)

  // If it's a public path or static asset, allow access
  if (isPublicPath) {
    return response
  }

  // For protected paths, check if the user is authenticated
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    // If the user is authenticated, allow access to all routes
    if (data?.user) {
      // If the path is the root, redirect to dashboard
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Allow access to all other routes for authenticated users
      return response
    }

    // If the user is not authenticated, redirect to signin
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  } catch (error) {
    console.error('Auth check error:', error)
    // If there's an error checking authentication, redirect to signin
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}