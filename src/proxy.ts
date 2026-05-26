import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

// DEV ONLY — désactiver en production
if (process.env.NODE_ENV === 'development') {
  return response
}

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (pathname.startsWith('/care/') && pathname !== '/care/login') {
      return NextResponse.redirect(new URL('/care/login', request.url))
    }
    if (pathname.startsWith('/doctor/')) {
      return NextResponse.redirect(new URL('/care/login', request.url))
    }
    return response
  }

  const { data: userData } = await supabase
    .from('users').select('role').eq('id', user.id).single()

  const role = userData?.role || 'patient'

  if (pathname.startsWith('/doctor/') && role !== 'doctor') {
    return NextResponse.redirect(new URL('/care/home', request.url))
  }

  if (pathname.startsWith('/care/') && pathname !== '/care/login' && role === 'doctor') {
    return NextResponse.redirect(new URL('/doctor/home', request.url))
  }

  return response
}

export const config = {
  matcher: ['/care/:path*', '/doctor/:path*']
}