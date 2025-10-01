import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. /map ページへのリクエストでなければ何もしない
  if (request.nextUrl.pathname !== '/map') {
    return NextResponse.next();
  }

  // 2. 本番環境でなければ何もしない
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  // 3. 許可するドメインを環境変数から取得（カンマ区切り）
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
  
  // 4. リファラを取得
  const referer = request.headers.get('referer');

  // リファラがない、または許可ドメインリストが空の場合は404
  if (!referer || allowedDomains.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const refererHost = new URL(referer).hostname;

    // 5. リファラのホスト名が許可リストに含まれているかチェック
    if (allowedDomains.some(domain => refererHost.endsWith(domain.trim()))) {
      // 許可されている場合はページを表示
      return NextResponse.next();
    }
  } catch (error) {
    // URLの解析に失敗した場合などもアクセスを拒否
    console.error('Error parsing referer URL:', error);
    return new NextResponse(null, { status: 404 });
  }

  // 6. 許可されていない場合は404
  return new NextResponse(null, { status: 404 });
}

// ミドルウェアが実行されるパスを指定
export const config = {
  matcher: '/map',
};
