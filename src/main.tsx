import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const outputs = Object.values(import.meta.glob('../amplify_outputs.json', {
  eager: true,
  import: 'default',
}))[0]

const ConnectedCms = lazy(async () => {
  const { initializeCms } = await import('./ConnectedCms')
  return { default: initializeCms(outputs) }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <header className="site-header">
      <img src="/icon.svg" width="36" height="36" alt="" />
      <span>NaniteLink CMS</span>
    </header>
    <main>
      {outputs ? (
        <Suspense fallback={<p role="status">CMS를 불러오는 중입니다.</p>}>
          <ConnectedCms />
        </Suspense>
      ) : (
        <section className="panel" aria-labelledby="preview-title">
          <span className="badge">로컬 미리보기</span>
          <h1 id="preview-title">NaniteLink CMS</h1>
          <p>AWS 연결 설정이 필요합니다. 연결하면 로그인과 게시판을 사용할 수 있습니다.</p>
          <p>개발 환경에서 <code>npx ampx sandbox</code>로 설정 파일을 생성한 후 앱을 다시 시작하세요.</p>
        </section>
      )}
    </main>
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.warn('서비스 워커를 등록하지 못했습니다.', error)
    })
  })
}
